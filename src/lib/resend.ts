// TODO: Configure Resend email client in Section 6
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);
