// app/api/users/route.ts

import Mailer from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { OneTimeSecret } from "@/lib/secrets-generator";
import { getGravatarUrl } from "@/lib/utils";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, userType, clientId } = body;

    if (!email || !userType) {
      return NextResponse.json(
        { error: "Missing required fields: email and userType" },
        { status: 400 }
      );
    }

    const { oneTimeSecretLink, encryptedPassword } =
      await OneTimeSecret.generateLink();

    const avatarUrl = getGravatarUrl(email);

    // Create the user in the database with the generated encrypted password.
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: encryptedPassword,
        userType,
        clientId: clientId || null,
        avatarUrl,
      },
    });

    const loginUrl = process.env.HOME_URL;
    const emailSubject =
      "Welcome to Hawktesters Client Portal - Important details about your new account";

    const emailHtml = `
                <div style="background-color: #f4f4f4; padding: 40px 0;">
                    <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 30px; border-radius: 8px; font-family: Arial, sans-serif; color: #333;">
                    <!-- Header with icon and company logo -->
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                        <tr>
                        <td align="left" style="vertical-align: middle;">
                            <img src="${process.env.COMPANY_LOGO_SMALL_URL}" alt="Company Logo" style="max-width: 50px;">
                        </td>
                        </tr>
                    </table>
                    
                    <p style="font-size: 18px; margin: 0;">
                        Dear ${name}
                    </p>
                    <p style="font-size: 16px; margin: 20px 0;">
                        We are pleased to welcome you to the Hawktesters Client Portal.
                    </p>
                    <p style="font-size: 14px; margin: 20px 0;">
                        For security reasons, we have generated a temporary password for your account. Please click the following link to retrieve it:
                    </p>
                    
                    <!-- Password Recovery Button -->
                    <p style="text-align: center; margin: 20px 0;">
                        <a href="${oneTimeSecretLink}" target="_blank" style="display: inline-block; background-color: #006330; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                        Retrieve your password here
                        </a>
                    </p>
                    
                    <!-- One-Time Link Notice -->
                    <div style="background-color: #e6f4ea; border: 1px solid #006330; border-radius: 4px; padding: 10px; margin: 20px 0;">
                        Important note: This link to retrieve your password is for one-time use only. Once you open it, it will become invalid. Please make sure to copy your temporary password; otherwise, you will need to request a new link.
                    </div>
                    
                    <!-- Temporary Password Usage Note -->
                    <p style="font-size: 14px; margin: 20px 0;">
                       With the temporary password, you can access your account. Upon your first login, you will be prompted to change your password for security reasons.
                    </p>
                    
                    <!-- Login Button -->
                    <p style="text-align: center; margin: 20px 0;">
                        <a href="${loginUrl}" target="_blank" style="display: inline-block; background-color: #006330; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                       Access your account
                        </a>
                    </p>
                    
                    <p style="font-size: 14px; margin: 20px 0;">
                        If you have any questions or need further assistance, please do not hesitate to contact our support team.
                    </p>
                    <p style="font-size: 14px; margin: 20px 0;">
                       Kind regards,
                    </p>
                    <p style="font-size: 14px; margin: 20px 0;">
                        Isaac Iglesias
                    </p>
                    
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <img src="${process.env.COMPANY_LOGO_URL}" alt="Hawktesters Logo" style="max-width: 200px;">
                    </div>
                    <!-- Privacy / Phishing Disclaimer -->
                    <p style="font-size: 8px; color: #777; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px;">
                        Important: For your security, never share your temporary password with anyone. HAWKTESTERS, S.L. will never ask you for your credentials. Please refer to our Privacy Policy for more details.
                    </p>
                    </div>
                </div>
                `;

    const mailer = new Mailer();
    await mailer.sendEmail({
      toList: email,
      subject: emailSubject,
      htmlMessage: emailHtml,
    });

    return NextResponse.json(
      {
        user,
        message: "User created. Please check your email to set your password.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}