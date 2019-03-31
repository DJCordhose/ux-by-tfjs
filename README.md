# ux-by-tfjs


Project: https://github.com/DJCordhose/ux-by-tfjs

Notebook for Server side processing: https://colab.research.google.com/github/DJCordhose/ux-by-tfjs/blob/master/notebooks/rnn-model.ipynb


## What does it do?

After training on your personal mouse paths it can predict what button you are likely to click on. You can then highlight that button for easier access or do anything else that might seem reasonable.

<img src='img/ux-predict.gif'>


## How does this work?

TODO

## What makes this hard?

This is specific to how my input device works (this does not work for touch)
- using trackpad
- windows / mac / linux
- using mouse
- speed of input device

And personal style
- beginner / expert
- fast / slow
- direct / curvy

## Possible improvements / next steps

* collect and store raw path data
  * decide what makes sense later, be more flexible
* split path to aim into fragments
  * better prediction: each good for prediction in different parts of the path
  * more training data
* create baselines to understand if this is really good
  * proximity based
  * interpolation of path using linear regression (or just dx/dy for a single point)
