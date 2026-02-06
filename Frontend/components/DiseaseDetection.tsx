// File: src/components/DiseaseDetection.tsx
import React, { useState } from 'react';
import { Upload, Image, Spin, message } from 'antd';
import { UploadOutlined, ReloadOutlined } from '@ant-design/icons';

interface DetectionResult {
  disease: string;
  confidence: number;
  description: string;
  treatment: string;
}

// Mock data for demonstration
const MOCK_RESPONSES = [
  {
    disease: 'Tomato Early Blight',
    confidence: 0.87,
    description: 'Early blight is a common tomato disease caused by the fungus Alternaria solani. It appears as concentric brown spots on leaves, often with a yellow halo.',
    treatment: 'Remove affected leaves, apply copper-based fungicides, and ensure proper plant spacing for air circulation.'
  },
  {
    disease: 'Tomato Late Blight',
    confidence: 0.92,
    description: 'Late blight is a serious disease caused by the oomycete Phytophthora infestans. It causes large, dark brown lesions on leaves and fruits.',
    treatment: 'Apply fungicides containing chlorothalonil or mancozeb, remove and destroy infected plants, and avoid overhead watering.'
  },
  {
    disease: 'Healthy Plant',
    confidence: 0.95,
    description: 'Your plant appears to be healthy with no signs of common diseases. The leaves are green and show no visible symptoms of stress or infection.',
    treatment: 'Continue with regular care including proper watering, adequate sunlight, and balanced fertilization.'
  }
];

const DiseaseDetection: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleChange = (info: any) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target?.result as string);
        // Simulate API call with random response
        setTimeout(() => {
          const randomResponse = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
          setResult(randomResponse);
          setLoading(false);
        }, 1500);
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  const handleRetry = () => {
    setImageUrl(null);
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 glass-card rounded-[2.5rem] border border-slate-200/60 shadow-2xl shadow-slate-200/50">
      <div className="text-center mb-10 space-y-2">
        <span className="text-emerald-600 font-black uppercase tracking-widest text-xs">AI Diagnostic Suite</span>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Plant Health <span className="gradient-text">Analysis</span></h2>
      </div>

      {!imageUrl ? (
        <div className="group relative border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center hover:border-emerald-500/50 hover:bg-emerald-50/30 transition-all duration-500 cursor-pointer overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Upload
            name="plantImage"
            listType="picture-card"
            className="uploader-premium"
            showUploadList={false}
            beforeUpload={beforeUpload}
            onChange={handleChange}
            accept="image/*"
            customRequest={({ onSuccess }: { onSuccess?: (body: any) => void }) => {
              if (onSuccess) {
                onSuccess('ok');
              }
            }}
          >
            <div className="space-y-4 relative z-10 transition-transform group-hover:scale-105 duration-500">
              <div className="bg-emerald-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-200 animate-float">
                <UploadOutlined className="text-3xl text-white" />
              </div>
              <div>
                <p className="text-xl font-black text-slate-900 tracking-tight">Drop your plant image</p>
                <p className="text-sm text-slate-500 font-medium">JPG, PNG up to 5MB supported</p>
              </div>
            </div>
          </Upload>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2">
              <div className="rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-inner p-4">
                <Image
                  src={imageUrl}
                  alt="Uploaded plant"
                  className="w-full h-auto max-h-96 object-contain rounded-2xl"
                />
              </div>
              <button
                onClick={handleRetry}
                className="mt-6 w-full py-4 bg-slate-900 text-white rounded-2xl font-black tracking-tight hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
              >
                <ReloadOutlined />
                <span>Analyze Another Plant</span>
              </button>
            </div>

            <div className="w-full md:w-1/2 space-y-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <Spin size="large" />
                  <div className="text-center">
                    <p className="text-slate-900 font-black tracking-tight">AI is analyzing leaf patterns...</p>
                    <p className="text-xs text-slate-500 font-medium">Applying neural networks for precision</p>
                  </div>
                </div>
              ) : result ? (
                <div className="space-y-6">
                  <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl -mr-8 -mt-8"></div>
                    <h3 className="text-sm font-black text-emerald-700 uppercase tracking-widest mb-4">Diagnostic Result</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase">Condition</span>
                        <span className="text-lg font-black text-slate-900">{result.disease}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase">Confidence</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${result.confidence * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-black text-emerald-600">{(result.confidence * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white rounded-3xl border border-slate-100">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</h4>
                    <p className="text-slate-700 font-medium leading-relaxed">{result.description}</p>
                  </div>

                  <div className="p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -mr-16 -mb-16"></div>
                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-3">Expert Treatment Protocol</h4>
                    <p className="text-slate-300 font-medium leading-relaxed italic border-l-2 border-emerald-500/50 pl-4">
                      {result.treatment}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseDetection;