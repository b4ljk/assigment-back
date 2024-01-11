import Joi from 'joi';

const getNonce = {
  query: Joi.object().keys({
    publicAddress: Joi.string()
  })
};

const verifySignature = {
  body: Joi.object().keys({
    publicAddress: Joi.string().required(),
    signedNonce: Joi.string().required()
  })
};

export default {
  getNonce,
  verifySignature
};
