const phkPromise = require('./phk-promise');

const promise = new phkPromise((resolve, reject) => {
    setTimeout(resolve, 500);
});

promise
    .then(
        () => {
            console.log('1: RESOLVE');
        },
        () => {
            console.log('1: REJECT');
        }
    )
    .then(() => {
        console.log('2: RESOLVE');
        
        throw new Error('Hi!');
    })
    .catch(error => {
        console.error(error);
    });
