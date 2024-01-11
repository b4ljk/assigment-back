import catchAsync from '../utils/catchAsync';
import { tokenService, verificationService } from '../services';

const getNonce = catchAsync(async (req, res) => {
  if (!req.query.publicAddress) throw new Error('publicAddress param required');

  const nonce = await verificationService.getNonce(String(req.query.publicAddress));
  res.send(nonce);
});

const verifySignature = catchAsync(async (req, res) => {
  const { publicAddress, signedNonce: signature } = req.body;
  const user = await verificationService.verifySignature(publicAddress, signature);
  if (!user) throw new Error('User not found');

  const tokens = await tokenService.generateAuthTokens(user);
  res.cookie('refreshToken', tokens.refresh, {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true
  });
  res.cookie('accessToken', tokens.access, {
    maxAge: 1000 * 60 * 60 * 24 * 7
  });

  res.send({ user, tokens });
});

export default {
  getNonce,
  verifySignature
};
