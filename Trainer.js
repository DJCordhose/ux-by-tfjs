import * as tf from '@tensorflow/tfjs';
// import * as tfvis from '@tensorflow/tfjs-vis';

import * as _ from 'lodash-es';

console.log(tf.version);
// console.log(tfvis.version);

const EPOCHS = 25;
const BATCH_SIZE = 50;

const N_FEATURES = 5;
const N_STEPS = 200;

const SEGMENT_SIZE = 50;

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
                units: 75,
                inputShape: [SEGMENT_SIZE, N_FEATURES]
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
        console.log('training on datasets', data.length)

        const xs = data.map(({ x }) => Object.values(x));
        // console.log(xs)

        // xs nDatasets, 200, 5
        // segmentSize = 50
        // nSegments = 200 / segmentSize
        // xsNew: nDatasets * nSegments, segmentSize, 5 

        let newXs = [];
        
        xs.forEach(x => {
            const chunks = _.chunk(x, SEGMENT_SIZE);
            // _.flatten()
            newXs = newXs.concat(chunks);
        });

        const ys = data.map(({ y }) => y - 1);


        let newYs = [];
        ys.forEach(y => {
            const labels = new Array(N_STEPS / SEGMENT_SIZE).fill(y);
            newYs = newYs.concat(labels);
        });

        console.assert(newXs.length === newYs.length, 'input and output should have the same length');
        console.assert(newXs.length === xs.length * N_STEPS / SEGMENT_SIZE, 'data size should be properly expanded');

        // ys nDatasets, 1

       // ysNew (nDatasets * nSegments) * 1


        const X = tf.tensor3d(newXs);
        const y = tf.tensor1d(newYs, "int32");

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
        const sample = newXs[0]
        // console.log(sample);
        console.log(await this.predict(sample))
        console.log(newYs[0])
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