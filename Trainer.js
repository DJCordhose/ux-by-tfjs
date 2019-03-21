import * as tf from '@tensorflow/tfjs';
// import * as tfvis from '@tensorflow/tfjs-vis';

console.log(tf.version);
// console.log(tfvis.version);

class Trainer {
    train(datasets) {
        console.log('trainer called', datasets)
    }
}

export const trainer = new Trainer()