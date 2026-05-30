/**
 * A simplified WebAuthn implementation for PWAs that want to use FaceID/TouchID
 * as a local biometric lock to retrieve a saved PIN or password.
 * 
 * Instead of requiring a complex relying party backend to verify signatures,
 * this approach creates a local credential. If `navigator.credentials.get` succeeds,
 * we consider the user physically verified by the OS biometrics.
 */

function bufferDecode(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "===".slice((base64.length + 3) % 4);
  return Uint8Array.from(atob(padded), c => c.charCodeAt(0));
}

// Helper to convert Uint8Array buffer to base64 string
function bufferEncode(value: ArrayBuffer): string {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(value) as unknown as number[])).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export async function isWebAuthnSupported(): Promise<boolean> {
  if (!window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch (e) {
    return false;
  }
}

/**
 * Prompts the OS for biometric registration (FaceID/TouchID).
 * Returns a credentialId string if successful.
 */
export async function registerBiometrics(): Promise<string> {
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);
  
  const userId = new Uint8Array(16);
  crypto.getRandomValues(userId);

  const createOptions: PublicKeyCredentialCreationOptions = {
    challenge: challenge,
    rp: {
      name: "Stocker App",
    },
    user: {
      id: userId,
      name: "user@stocker.local",
      displayName: "Stocker User"
    },
    pubKeyCredParams: [
      { type: "public-key", alg: -7 }, // ES256
      { type: "public-key", alg: -257 } // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: "platform", // Force FaceID/TouchID/Windows Hello
      userVerification: "required"
    },
    timeout: 60000,
    attestation: "none"
  };

  try {
    const credential = await navigator.credentials.create({ publicKey: createOptions }) as PublicKeyCredential;
    if (!credential) throw new Error("Failed to create credential");
    
    return bufferEncode(credential.rawId);
  } catch (error: any) {
    console.error("Biometric registration failed:", error);
    throw new Error(error.message || "Failed to register biometrics");
  }
}

/**
 * Prompts the OS for biometric verification using a previously saved credentialId.
 * Returns true if the user successfully authenticated.
 */
export async function verifyBiometrics(credentialId: string): Promise<boolean> {
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);

  const getOptions: PublicKeyCredentialRequestOptions = {
    challenge: challenge,
    allowCredentials: [{
      type: "public-key",
      id: bufferDecode(credentialId) as any
    }],
    userVerification: "required",
    timeout: 60000,
  };

  try {
    const credential = await navigator.credentials.get({ publicKey: getOptions }) as PublicKeyCredential;
    return !!credential;
  } catch (error) {
    console.error("Biometric verification failed:", error);
    return false;
  }
}
