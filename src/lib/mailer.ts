import nodemailer from "nodemailer";

export interface IAttachment {
  filename: string;
  path: string; // stream this file
}

export interface MailOptions {
  toList: string[] | string;
  subject: string;
  message?: string;
  attachments?: IAttachment | Array<IAttachment>; // path to file on disk as attachment
  htmlMessage?: string; // html message
}

class Mailer {
  private static readonly from: string =
    '"Hawktesters" <isaac.iglesias@hawktesters.com>';

  public constructor() {}

  public async sendEmail(options: MailOptions) {
    var { toList, subject, message, attachments, htmlMessage } = options;

    if (!message && !attachments && !htmlMessage) {
      throw new Error(
        "The email must have at least a message or an attachment"
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.gmail.com",
      port: 587, // or 25, but 587 with STARTTLS is common
      secure: false, // use TLS (not SSL) - "secure" true means port 465
      requireTLS: true, // ensure STARTTLS is used if possible
      // No 'auth' key needed if IP is trusted.
    });

    if (typeof toList === "string") {
      toList = [toList];
    }

    for (let i = 0; i < toList.length; i++) {
      let nodeMailerOptions: any = {
        from: Mailer.from, // sender address
        to: toList[i], // list of receivers
        subject: subject, // Subject line
        message: message, // plain text body
        htmlMessage: htmlMessage, // html body
      };

      if (message) nodeMailerOptions["message"] = message;
      if (htmlMessage) nodeMailerOptions["html"] = htmlMessage;
      if (attachments) {
        if (!Array.isArray(attachments)) attachments = [attachments];
        nodeMailerOptions["attachments"] = attachments;
      }

      let info = await transporter.sendMail(nodeMailerOptions);

      console.log("Message sent: %s", info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

      console.log(`Response: ${info.response}`);

      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }
  }
}

export default Mailer;
