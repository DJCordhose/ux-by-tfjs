// import * as tf from '@tensorflow/tfjs';
// import * as tfvis from '@tensorflow/tfjs-vis';

import * as _ from 'lodash-es';

// console.log(tf.version);
// console.log(tfvis.version);

const EPOCHS = 100;
const BATCH_SIZE = 200;

const N_FEATURES = 5;
const N_STEPS = 200;

const SEGMENT_SIZE = 25;
const N_SEGMENTS = 2;

const SEED = undefined;

const MODEL_URL =
    "https://raw.githubusercontent.com/DJCordhose/ux-by-tfjs/master/model/ux.json";

const CONVERTED_MODEL_URL =
    "https://raw.githubusercontent.com/DJCordhose/ux-by-tfjs/master/model/model.json";


const CLICK_MODEL_URL =
    "https://raw.githubusercontent.com/DJCordhose/ux-by-tfjs/master/model/click/model.json";

const CLICK_MODEL_OVERFIT_URL =
    "https://raw.githubusercontent.com/DJCordhose/ux-by-tfjs/master/model/click-overfit/model.json";

class Trainer {

    constructor() {
        this.init();
        this.loadClickModel();
    }

    init() {
        this.model = tf.sequential();
        window.trainer = this;
        this.model.add(
            // tf.layers.gru({
            //     name: "gru1",
            //     activation: 'tanh',
            //     // activation: 'relu',
            //     // kernelInitializer: tf.initializers.glorotNormal({ seed: SEED }),
            //     units: 50,
            //     inputShape: [SEGMENT_SIZE, N_FEATURES],
            //     dropout: 0.2
            // })
            // slower to train and worse evaluation, but really good real world performance
            // tf.layers.lstm({
            //     name: "lstm1",
            //     activation: 'tanh',
            //     // activation: 'relu',
            //     kernelInitializer: tf.initializers.glorotNormal({ seed: SEED }),
            //     units: 50,
            //     inputShape: [SEGMENT_SIZE, N_FEATURES],
            //     dropout: 0.1
            // })
            // trains fast, bad evaluation, but in real life does what we expect, only uses very recent history, generalizing great by proximity
            tf.layers.simpleRNN({
                name: "rnn1",
                activation: 'tanh',
                // activation: 'relu',
                // kernelInitializer: tf.initializers.glorotNormal({ seed: SEED }),
                units: 50,
                // units: 75,
                inputShape: [SEGMENT_SIZE, N_FEATURES],
                // dropout: 0.6
                dropout: 0.1
            })
        );
        this.model.add(tf.layers.batchNormalization());
        this.model.add(
            tf.layers.dense({
                name: "softmax",
                units: 3,
                kernelInitializer: tf.initializers.glorotNormal({ seed: SEED }),
                activation: "softmax"
            })
        );
        // this.model.summary();
    }

    prepareData(data) {
        console.log('preparing datasets', data.length)

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

        const uniqLabels = _.sortBy(_.uniq(newYs));
        console.log(uniqLabels)

        console.assert(newXs.length === newYs.length, 'input and output should have the same length');
        // console.assert(newXs.length === xs.length * N_STEPS / SEGMENT_SIZE, 'data size should be properly expanded');
        console.assert(_.isEqual(uniqLabels, [0, 1, 2]), 'labels should only be 0, 1, or 2');

        const X = tf.tensor3d(newXs);
        const y = tf.tensor1d(newYs, "int32");

        return {
            X,
            y,
            xs: newXs,
            ys: newYs
        }
    }

    async train(data) {
        const { X, y, xs, ys } = this.prepareData(data);

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

        const metrics = ["loss", "val_loss", "acc", "val_acc"];
        const container = {
            name: 'show.fitCallbacks',
            tab: 'Training',
            styles: {
                height: '1000px'
            }
        }
        const vizCallbacks = tfvis.show.fitCallbacks(container, metrics);

        this.model.compile({
            loss: "sparseCategoricalCrossentropy",
            optimizer: "adam",
            metrics: ["accuracy"]
        });

        const history = await this.model.fit(X, y, {
            epochs: EPOCHS,
            validationSplit: 0.2,
            batchSize: BATCH_SIZE,
            shuffle: true,
            callbacks: vizCallbacks
            // callbacks: consoleCallbacks
        });

        const { acc, loss, val_acc, val_loss } = history.history;
        const summary = `accuracy: ${
            acc[acc.length - 1]
            }, accuracy on unknown data: ${val_acc[val_acc.length - 1]}`;
        console.log(summary);

        const sample = xs[0]
        // console.log(sample);
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
        console.log('model loaded locally')
    }

    async loadRemote() {
        // const url = CONVERTED_MODEL_URL;
        const url = MODEL_URL;
        console.log(`loading remote model from ${url}`)
        // https://js.tensorflow.org/api/latest/#loadGraphModel
        this.model = await tf.loadLayersModel(url);
    }

    async upload() {
        const jsonUpload = document.getElementById('json-upload');
        const weightsUpload = document.getElementById('weights-upload');
    
        this.model = await tf.loadLayersModel(
        tf.io.browserFiles([jsonUpload.files[0], weightsUpload.files[0]]));
        console.log('model uploaded successfully')
    }

    async predict(X) {
        const prediction = await this.model.predict(tf.tensor3d([X])).data();
        console.log(prediction)
        return prediction;
    }

    showModel() {
        const surface = {
            name: 'Model Summary',
            tab: 'Model'
        };
        tfvis.show.modelSummary(surface, this.model);
    }

    showVisor() {
        const visor = tfvis.visor();
        visor.toggle();
    }

    async showEvaluation(data) {
        const { X, y, xs, ys } = this.prepareData(data);

        const classNames = ["Left Button", "Middle Button", "Right Button"];
        const yTrue = y;
        const yPred = this.model.predict(X).argMax([-1]);

        const confusionMatrix = await tfvis.metrics.confusionMatrix(yTrue, yPred);
        const container = {
            name: 'Confusion Matrix',
            tab: 'Evaluation'
        };
        tfvis.show.confusionMatrix(container, confusionMatrix, classNames);

        const classAccuracy = await tfvis.metrics.perClassAccuracy(yTrue, yPred);
        const accuracyContainer = {
            name: 'Accuracy',
            tab: 'Evaluation'
        };
        tfvis.show.perClassAccuracy(accuracyContainer, classAccuracy, classNames);

    }

    async loadClickModel() {
        const url = CLICK_MODEL_URL;
        // const url = CLICK_MODEL_OVERFIT_URL
        console.log(`loading click model from ${url}`)
        this.clickModel = await tf.loadLayersModel(url);
    }

    async predictClick(X) {
        if (!this.clickModel) {
            await this.loadClickModel();
        }
        const prediction = await this.clickModel.predict(tf.tensor([X])).data();
        console.log(prediction)
        return prediction;
    }

}

export const trainer = new Trainer()