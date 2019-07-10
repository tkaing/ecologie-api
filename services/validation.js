exports.EMAIL = 'Ce champ doit être un e-mail valide.';
exports.PHONE = 'Ce champ doit être un numéro français.';
exports.INTEGER = 'Ce champ doit obligatoirement être un entier.';
exports.LOCATION = 'Ce champ doit être une position valide.';
exports.NOT_BLANK = 'Ce champ doit obligatoirement être rempli.';

exports.validate = (options) => {

    const validators = [];

    options.forEach(function (option) {
        validators.push(option.validator);
    });

    return validators;
};