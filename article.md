---
title: Improving User Experience with TensorFlow.js
published: false
description: 
tags: tensorflow.js, ux, ml
---

# Improving User Experience with TensorFlow.js

Imagine you have an application with some buttons or other interactive elements. To make clear which button you would click they often highlight when you click on them. Much like this 

![Buttons highlighting when hovering over them](https://raw.githubusercontent.com/DJCordhose/ux-by-tfjs/master/img/app.gif "Our Application")

Now imagine we would be able to highlight the interactive element *before* you hover over it. This might be useful for at least two reasons

1. Prepare resources in advance
   * toggle lazy loading of images or iframes to eager earlier (
https://dev.to/ben/native-lazy-loading-for-img-and-iframe-is-coming-to-the-web-55on)
   * Serverless function pre-start
   * Module pre-load
   * AR: where would people look at soon? render more details
2. (unnoticeably) highlight button to make it easier to access for user, thus giving them a better user experience without them necessarily knowing why

Such a highlighting system could look like this. We did not make the highlight very subtle, to make clear what is going on:

![Buttons highlighting when the machine thinks I am going to click them soon](https://raw.githubusercontent.com/DJCordhose/ux-by-tfjs/master/img/simpleRNN.gif "Highlighting in Advance")

This is just one way of predicting the button, but there could be ways of of predictions that take the path you are moving on into account much more, like this one

![Buttons highlighting when the machine thinks I am going to click them soon](https://raw.githubusercontent.com/DJCordhose/ux-by-tfjs/master/img/ux-predict-3.gif "Highlighting using the Path")

This way the system would have a solid prediction earlier than the first system, however at the cost of less certainty. 

## But how can this be done?

I could well imagine that for the specific highlights I have shown, there could be heuristic that either highlights a button when we are close to it and closer than to any other button or one that does a simple regression drawing a line through you mouse movements and sees what button you are pointing to. 

This can be tricky, though, because different computers would have different resolutions, different track pads or mouses. And - more importantly - different types of users would use their devices very differently based on level of experience and personality. I for example like track pads with extremely high sensitivity that sometimes make me jump over a button requiring to go back a little bit. 

## Machine Learning to the rescue

The idea of machine learning is that we collect some information about how a certain user on a specific machine clicks those buttons. Using that data we hope to create a more general model that can predict future uses of that user interface. 

Any kind of data that contains any useful information for a prediction would be a good input. As a rule of thumb: The better the quality of the data and the more data the better. In our case we can very easily collect mouse events that give us a sequence of mouse positions and a delta from the previous position. Additionally, we can add a time delta between the events which effectively gives a us a sequence of five data points over time that you can see in this developer tools screenshot in the browser:


![Screenshot from dev tools of mouse sequence data in local storage](https://raw.githubusercontent.com/DJCordhose/ux-by-tfjs/master/img/mouse-positions.png "Mouse Sequence Data")

We store this sequence under the name of `x` and the a code for the button that has been clicked following such a sequence of mouse movements as `y`. In this example `1` might stand for the first button. That means we have a number of sequences, one for each mouse movement that resulted in a button being pressed, ten in our example.

## Privacy

Before we talk about how we will use that data, let us talk about privacy. How would you like every movement of your mouse to leave your computer to create a model on your very personal behavior? While some people arguably would not mind, some - including myself - would. Our solution is to keep the data in your browser, on your disk and train the model right in the browser and also leave that in your browser as a default. 

## TensorFlow.js

![TensorFlow.js is a library for developing and training ML models in JavaScript, and deploying in browser or on Node.js](https://raw.githubusercontent.com/DJCordhose/ux-by-tfjs/master/img/tfjs.png "TensorFlow.js")


Exactly this is possible using 

Now, how would like  

```javascript

this.model = tf.sequential();
this.model.add(
    tf.layers.simpleRNN({
        inputShape: [SEGMENT_SIZE, N_FEATURES],
        units: 50,
        activation: 'tanh',
        dropout: 0.1
    }));


```
