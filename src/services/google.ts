import { GoogleSignin } from "@react-native-google-signin/google-signin";

const googleWebClientId =
  "717353489884-58ran11gduia9jo59gbj0uunkjhaj3e4.apps.googleusercontent.com";

let configured = false;

export function configureGoogleSignin() {
  if (configured) {
    return;
  }

  GoogleSignin.configure({
    webClientId: googleWebClientId,
  });

  configured = true;
}
