import * as tf from '@tensorflow/tfjs';
// import * as tfvis from '@tensorflow/tfjs-vis';

import * as _ from 'lodash-es';

console.log(tf.version);
// console.log(tfvis.version);

const EPOCHS = 500;
const BATCH_SIZE = 200;

const N_FEATURES = 5;
const N_STEPS = 200;

const SEGMENT_SIZE = 25;
const N_SEGMENTS = 2;

const SEED = undefined;

const MODEL_URL =
  "https://raw.githubusercontent.com/DJCordhose/ux-by-tfjs/master/model/ux.json";

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
                // activation: 'relu',
                // kernelInitializer: tf.initializers.glorotNormal({ seed: SEED }),
                units: 50,
                inputShape: [SEGMENT_SIZE, N_FEATURES],
                dropout: 0.1
            })
        );
        this.model.add(tf.layers.batchNormalization());
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
            let chunks = _.chunk(x, SEGMENT_SIZE);
            chunks = chunks.slice(chunks.length - N_SEGMENTS)
            newXs = newXs.concat(chunks);
        });

        // ys nDatasets, 1
       // ysNew (nDatasets * nSegments) * 1
        const ys = data.map(({ y }) => y - 1);
        let newYs = [];
        ys.forEach(y => {
            const labels = new Array(N_SEGMENTS).fill(y);
            newYs = newYs.concat(labels);
        });

        console.assert(newXs.length === newYs.length, 'input and output should have the same length');
        // console.assert(newXs.length === xs.length * N_STEPS / SEGMENT_SIZE, 'data size should be properly expanded');
        console.assert(_.isEqual(_.uniq(newYs), [0, 1, 2]), 'labels should only be 0, 1, or 2');

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
            // shuffle: true,
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
        console.log('model loaded locally')
    }

    async loadRemote() {
        // https://js.tensorflow.org/api/latest/#loadGraphModel
        this.model = await tf.loadLayersModel(MODEL_URL);
        console.log(`remote model loaded from ${MODEL_URL}`)
    }


    async predict(X) {
        const prediction = await this.model.predict(tf.tensor3d([X])).data();
        console.log(prediction) 
        return prediction;
    }

    async showVisor() {
        const surface = {
          name: 'Model Summary',
          tab: 'Model'
        };
        tfvis.show.modelSummary(surface, this.model);
      }
}

export const trainer = new Trainer()