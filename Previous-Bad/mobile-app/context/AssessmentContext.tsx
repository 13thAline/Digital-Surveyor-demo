import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface DamageResult {
    partDetected: string;
    damageType: string;
    severityScore: number; // 0-100
    confidenceScore: number; // 0-1
    estimatedCost: number;
    laborCost: number;
    partsCost: number;
    locationMultiplier: number;
    annotatedImageUrl?: string;
    heatmapUrl?: string;
}

interface AssessmentState {
    capturedImageUri: string | null;
    annotatedImageUri: string | null;
    heatmapUri: string | null;
    isProcessing: boolean;
    damageResult: DamageResult | null;
    error: string | null;
}

interface AssessmentContextType extends AssessmentState {
    setCapturedImage: (uri: string) => void;
    setAnalysisImages: (annotated: string | null, heatmap: string | null) => void;
    setIsProcessing: (processing: boolean) => void;
    setDamageResult: (result: DamageResult) => void;
    setError: (error: string | null) => void;
    resetAssessment: () => void;
}

const initialState: AssessmentState = {
    capturedImageUri: null,
    annotatedImageUri: null,
    heatmapUri: null,
    isProcessing: false,
    damageResult: null,
    error: null,
};

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function AssessmentProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AssessmentState>(initialState);

    const setCapturedImage = (uri: string) => {
        setState(prev => ({ ...prev, capturedImageUri: uri, error: null }));
    };

    const setAnalysisImages = (annotated: string | null, heatmap: string | null) => {
        setState(prev => ({ ...prev, annotatedImageUri: annotated, heatmapUri: heatmap }));
    };

    const setIsProcessing = (processing: boolean) => {
        setState(prev => ({ ...prev, isProcessing: processing }));
    };

    const setDamageResult = (result: DamageResult) => {
        setState(prev => ({ ...prev, damageResult: result, isProcessing: false }));
    };

    const setError = (error: string | null) => {
        setState(prev => ({ ...prev, error, isProcessing: false }));
    };

    const resetAssessment = () => {
        setState(initialState);
    };

    return (
        <AssessmentContext.Provider
            value={{
                ...state,
                setCapturedImage,
                setAnalysisImages,
                setIsProcessing,
                setDamageResult,
                setError,
                resetAssessment,
            }}
        >
            {children}
        </AssessmentContext.Provider>
    );
}

export function useAssessment() {
    const context = useContext(AssessmentContext);
    if (!context) {
        throw new Error('useAssessment must be used within an AssessmentProvider');
    }
    return context;
}
