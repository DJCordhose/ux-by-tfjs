import * as tf from '@tensorflow/tfjs';
// import * as tfvis from '@tensorflow/tfjs-vis';

console.log(tf.version);
// console.log(tfvis.version);

const EPOCHS = 25;
const BATCH_SIZE = 50;

const N_FEATURES = 5;
const N_STEPS = 200;

const SEED = undefined;

class Trainer {

    constructor() {
        this.init();
    }

    init() {
        this.model = tf.sequential();
        window.trainer = this;
        this.model.add(
            tf.layers.gru({
                name: "gru1",
                activation: 'tanh',
                // kernelInitializer: tf.initializers.glorotNormal({ seed: SEED }),
                units: 50,
                inputShape: [N_STEPS, N_FEATURES]
            })
        );
        this.model.add(
            tf.layers.dense({
                name: "softmax", 
                units: 3,
                // kernelInitializer: tf.initializers.glorotNormal({ seed: SEED }),
                activation: "softmax"
            })
        );
        this.model.compile({
            loss: "sparseCategoricalCrossentropy",
            optimizer: "adam",
            metrics: ["accuracy"]
        });
        // this.model.summary();
    }

    async train(data) {
        const xs = data.map(({ x }) => Object.values(x));
        // console.log(xs)

        const ys = data.map(({ y }) => y - 1);
        console.log(ys)

        console.log('training on datasets', data.length)

        const X = tf.tensor3d(xs);
        const y = tf.tensor1d(ys, "int32");

        const consoleCallbacks = {
            onEpochEnd: (...args) => {
                console.log(...args);
            },
            // onBatchEnd: (...args) => {
            //     console.log(...args);
            // },
            // onEpochBegin: iteration => {
            //     // console.clear();
            //     console.log(iteration);
            // }
        };

        const history = await this.model.fit(X, y, {
            epochs: EPOCHS,
            validationSplit: 0.2,
            batchSize: BATCH_SIZE,
            shuffle: true,
            callbacks: consoleCallbacks
        });
        const { acc, loss, val_acc, val_loss } = history.history;
        const summary = `accuracy: ${
            acc[acc.length - 1]
            }, accuracy on unknown data: ${val_acc[val_acc.length - 1]}`;
        console.log(summary);
        const sample = xs[0]
        console.log(sample);
        console.log(await this.predict(sample))
        console.log(ys[0])
    }

    async save() {
        await this.model.save("indexeddb://ux");
        console.log(await tf.io.listModels());
    }

    async download() {
        await this.model.save("downloads://ux");
    }

    async load() {
        this.model = await tf.loadLayersModel('indexeddb://ux');
        console.log('model loaded')
    }

    async predict(X) {
        const prediction = await this.model.predict(tf.tensor3d([X])).data();
        console.log(prediction) 
        return prediction;
    }

}

export const trainer = new Trainer()