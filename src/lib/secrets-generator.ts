// lib/OneTimeSecret.ts
import axios from "axios";
import crypto from "crypto";
import argon2 from "argon2";

export class OneTimeSecret {
  /**
   * Generates a one-time secret link by:
   * 1. Creating a strong random temporary password.
   * 2. Hashing the temporary password using bcrypt.
   * 3. Sending the temporary password to the OneTimeSecret API to get a secret link.
   *
   * @returns An object containing the generated one-time secret link and the encrypted password.
   */
  static async generateLink(): Promise<{
    oneTimeSecretLink: string;
    encryptedPassword: string;
  }> {
    // Generate a strong random temporary password (32-hex-character string)
    const randomPassword = crypto.randomBytes(16).toString("hex");

    console.log("RANDOM PASSWORD: ", randomPassword);
    // Hash the temporary password with bcrypt using 12 salt rounds
    const encryptedPassword = await argon2.hash(randomPassword);

    // Prepare the OneTimeSecret API parameters
    const oneTimeSecretUrl = "https://us.onetimesecret.com/api/v1/share";
    const params = new URLSearchParams();
    params.append("secret", randomPassword);
    params.append("ttl", "21600"); // TTL of 6 hours in seconds

    // Optionally add passphrase if provided in environment variables
    const passphrase = process.env.OTS_PASSPHRASE;
    if (passphrase) {
      params.append("passphrase", passphrase);
    }

    try {
      // Make the POST request with URL-encoded data
      const otsResponse = await axios.post(oneTimeSecretUrl, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      // Extract the secret_key from the response
      const { secret_key } = otsResponse.data;
      // Construct the one-time secret link
      const oneTimeSecretLink = `https://us.onetimesecret.com/secret/${secret_key}`;

      return { oneTimeSecretLink, encryptedPassword };
    } catch (otsError) {
      console.error(`OneTimeSecret error: ${otsError}`);
      throw new Error("Could not create one-time secret link");
    }
  }
}
