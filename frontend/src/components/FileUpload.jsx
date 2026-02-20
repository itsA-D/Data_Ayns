import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { datasetService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const FileUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const onDrop = useCallback((acceptedFiles) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile && selectedFile.name.endsWith('.csv')) {
            setFile(selectedFile);
            setError(null);
            setSuccess(false);
        } else {
            setError('Please upload a valid CSV file.');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'text/csv': ['.csv'] },
        multiple: false
    });

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name.replace('.csv', ''));

        try {
            const response = await datasetService.upload(formData);
            setSuccess(true);
            setFile(null);
            if (onUploadSuccess) onUploadSuccess(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to upload dataset.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="glass-panel p-8 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Upload size={20} className="text-blue-400" />
                Upload New Dataset
            </h2>

            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'
                    }`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-blue-400">
                        <FileText size={24} />
                    </div>
                    {isDragActive ? (
                        <p className="text-blue-400 font-medium">Drop the CSV here...</p>
                    ) : (
                        <p className="text-slate-400">
                            Drag & drop a CSV file here, or click to select
                        </p>
                    )}
                    <span className="text-xs text-slate-500">Max size: 16MB</span>
                </div>
            </div>

            <AnimatePresence>
                {file && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 p-3 bg-slate-800/50 rounded-lg flex items-center justify-between border border-slate-700"
                    >
                        <div className="flex items-center gap-3">
                            <FileText size={20} className="text-blue-400" />
                            <div>
                                <p className="text-sm font-medium text-slate-200">{file.name}</p>
                                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                            className="p-1 hover:bg-slate-700 rounded-full text-slate-400"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {success && (
                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center gap-2 text-sm">
                    <CheckCircle size={16} />
                    Dataset uploaded successfully!
                </div>
            )}

            {file && (
                <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-lg shadow-blue-900/20 font-medium"
                >
                    {uploading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            Processing...
                        </>
                    ) : 'Analyze Dataset'}
                </button>
            )}
        </div>
    );
};

export default FileUpload;
