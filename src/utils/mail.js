import { text } from "express";
import Mailgen from "mailgen";
import nodemailer from 'nodemailer'


const SendMail = async function(options) {
    const mailgenerator = new Mailgen({
        theme : 'default',
        product : {
            name : 'Task Manager',
            link : 'http://taskmananegrlink.com'
        },
    })


    const emailTextual = mailgenerator.generatePlaintext(options.mailgenContent)
    const emailHTML = mailgenerator.generate(options.mailgenContent)

    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_TRAP_HOST,
        port: process.env.MAIL_TRAP_PORT,
        auth: {
            user: process.env.MAIL_TRAP_USER,
            pass: process.env.MAIL_TRAP_PASS
        }
    })

    const mail = {
        from: "testingpurpose0010@gmail.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHTML
    }

    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.log("email service failed silently ", error);
        
    }

}
const EmailverificationMailgen = (username, emailverificationurl) => {
    return  {
        body: {
            name: username,
            intro: 'Welcome to Our Application! We\'re very excited to have you on board.',
            action: {
                instructions: 'To verify your mail please click on the following button',
                button: {
                    color: '#22BC66',
                    text: 'verify your email',
                    link: emailverificationurl
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }
}
const ForgotPasswordMailgen = function(username, resetpasswordurl) {
    return  {
        body: {
        name: username,
        intro: 'we got a request to reset the password of your account ',
        action: {
            instructions: 'To reset your password please click on the following button',
            button: {
                color: '#ffee00ff',
                text: 'Reset your password !',
                link: resetpasswordurl
            }
        },
        outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
    }
    }
}

export  {EmailverificationMailgen, ForgotPasswordMailgen, SendMail}