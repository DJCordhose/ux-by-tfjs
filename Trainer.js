import * as tf from '@tensorflow/tfjs';
// import * as tfvis from '@tensorflow/tfjs-vis';

console.log(tf.version);
// console.log(tfvis.version);

const N_FEATURES = 4;
const N_STEPS = 25;

const model = tf.sequential();
model.add(
    tf.layers.gru({
        name: "gru1",
        activation: 'relu',
        units: 50,
        inputShape: [N_FEATURES, N_STEPS]
    })
);
model.add(
    tf.layers.dense({ name: "softmax", units: 3, activation: "softmax" })
);
model.summary();
model.compile({
    loss: "sparseCategoricalCrossentropy",
    optimizer: "adam",
    metrics: ["accuracy"]
});

const EPOCHS = 5;
const BATCH_SIZE = 10;

class Trainer {
    async train(data) {
        console.log('trainer called', data)

        const xs = data.map(({ x }) => Object.values(x));
        console.log(xs)

        const ys = data.map(({ y }) => parseInt(y[1]) - 1);
        console.log(ys)

        // const X = tf.tensor2d(xs, [xs.length, 4]);
        const X = tf.tensor2d(xs);
        const y = tf.tensor1d(ys, "int32");

        const history = await model.fit(X, y, {
            epochs: EPOCHS,
            validationSplit: 0.2,
            batchSize: BATCH_SIZE,
            shuffle: true
        });
        const { acc, loss, val_acc, val_loss } = history.history;
        const summary = `accuracy: ${
            acc[acc.length - 1]
            }, accuracy on unknown data: ${val_acc[val_acc.length - 1]}`;
        console.log(summary);
    }
}

export const trainer = new Trainer()