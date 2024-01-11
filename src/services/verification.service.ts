import { CryptoLoginNonce, Role, Prisma, User } from '@prisma/client';
import prisma from '../client';
import crypto from 'crypto';
import { ethers } from 'ethers';

/**
 * Get user by id
 * @param {ObjectId} publicAddress
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<CryptoLoginNonce, Key> | null>}
 */
const getNonce = async <Key extends keyof CryptoLoginNonce>(
  publicAddress: string,
  keys: Key[] = ['expires', 'nonce', 'userId'] as Key[]
): Promise<{ nonce: string; isFirstLogin: boolean } | null> => {
  const nonce = crypto.randomBytes(32).toString('hex');

  const expires = new Date(new Date().getTime() + 1000 * 60 * 60);

  const isFirstLogin = (await prisma.user.count({ where: { publicAddress } })) === 0;

  await prisma.user.upsert({
    where: { publicAddress },
    create: {
      publicAddress,
      CryptoLoginNonce: {
        create: {
          nonce,
          expires
        }
      }
    },
    update: {
      CryptoLoginNonce: {
        upsert: {
          create: {
            nonce,
            expires
          },
          update: {
            nonce,
            expires
          }
        }
      }
    }
  });

  return { nonce, isFirstLogin };
};

const verifySignature = async (
  publicAddress: string,
  signedNonce: string
): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: { publicAddress },
    include: { CryptoLoginNonce: true }
  });

  if (!user?.CryptoLoginNonce) return null;

  console.log(user);

  // Compute the signer address from the saved nonce and the received signature
  const signerAddress = ethers.verifyMessage(user.CryptoLoginNonce.nonce, signedNonce);
  console.log(signerAddress, publicAddress, 'signerAddress, publicAddress');
  // Check that the signer address matches the public address
  //  that is trying to sign in
  if (signerAddress !== publicAddress) return null;

  if (user.CryptoLoginNonce.expires < new Date()) return null;

  await prisma.cryptoLoginNonce.delete({ where: { userId: user.id } });

  if (!user.publicAddress) return null;

  return user;
};

export default {
  getNonce,
  verifySignature
};
