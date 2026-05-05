from utils.freshness_predictor import get_freshness_predictor
predictor = get_freshness_predictor()
print('model_path=', predictor.model_path)
print('model_loaded=', predictor.model is not None)
try:
    predictor.load_model()
    print('loaded model OK')
except Exception as e:
    print('load error', repr(e))
