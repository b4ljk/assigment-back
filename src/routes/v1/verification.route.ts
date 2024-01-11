import express from 'express';
import { verificationController } from '../../controllers';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import verificationValidation from '../../validations/verification.validation';

const router = express.Router();

router
  .route('/')
  .post(validate(verificationValidation.verifySignature), verificationController.verifySignature);

router.route('/').get(auth('manageUsers'), verificationController.verifySignature);

router
  .route('/nonce')
  .get(validate(verificationValidation.getNonce), verificationController.getNonce);

export default router;
