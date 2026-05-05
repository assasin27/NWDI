"""
Export the trained model from the Jupyter notebook to the backend models directory.

This script reads the notebook, extracts the model training code, and saves
the model to the correct location for the Django backend to use.

Usage (from within Kaggle notebook or after downloading notebook):
    # Option 1: Run this in the notebook after training
    %run export_model_from_notebook.py --output /kaggle/working/models

    # Option 2: Run locally after downloading the notebook and model
    python export_model_from_notebook.py --model_path PATH_TO_MODEL.h5 --output ./models
"""

import os
import argparse
import shutil


def export_model(model, output_dir):
    """
    Export the trained Keras model to the output directory.

    Args:
        model: Trained Keras model (model_B from the notebook)
        output_dir: Directory to save the model
    """
    os.makedirs(output_dir, exist_ok=True)

    model_path = os.path.join(output_dir, 'freshness_model.h5')
    model.save(model_path)

    print(f"Model exported to: {model_path}")
    print(f"Model summary:")
    model.summary()

    return model_path


def export_from_kaggle(output_dir):
    """
    Export model from Kaggle notebook environment.
    Run this cell at the end of the notebook after training.
    """
    # This assumes model_B is the trained model from the notebook
    import sys

    # Try to get model_B from the global namespace
    if 'model_B' in globals():
        model = globals()['model_B']
        print("Found trained model_B in notebook")
        return export_model(model, output_dir)
    else:
        print("model_B not found in notebook globals")
        print("Make sure to run this script AFTER training the model")
        return None


def main():
    parser = argparse.ArgumentParser(description='Export freshness model')
    parser.add_argument('--model_path', type=str, default=None,
                        help='Path to existing .h5 model file')
    parser.add_argument('--output_dir', type=str, default='./models',
                        help='Output directory for the model')
    parser.add_argument('--from_notebook', action='store_true',
                        help='Export from current notebook environment')

    args = parser.parse_args()

    if args.from_notebook:
        # Running inside notebook
        export_from_kaggle(args.output_dir)
    elif args.model_path:
        # Copy existing model file
        if not os.path.exists(args.model_path):
            print(f"Error: Model file not found: {args.model_path}")
            return

        os.makedirs(args.output_dir, exist_ok=True)
        output_path = os.path.join(args.output_dir, 'freshness_model.h5')
        shutil.copy2(args.model_path, output_path)
        print(f"Model copied to: {output_path}")
    else:
        print("Specify --model_path to copy an existing model,")
        print("or use --from_notebook when running inside the Kaggle notebook")


if __name__ == '__main__':
    main()
