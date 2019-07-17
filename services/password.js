exports.SECRET = '8y4bGkD9Y';

exports.generate = () => {

    const LENGTH = 8;
    const CHARSET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const MAX = CHARSET.length;

    let password = "";

    for (let i = 0; i < LENGTH; ++i) {
        password += CHARSET.charAt(Math.floor(Math.random() * MAX));
    }

    return password;
};