import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AnalyzePage from '../../../app/analyze/page';
import { aiStudioClient } from '../../../lib/aiStudioClient';

// Mock aiStudioClient
jest.mock('../../../lib/aiStudioClient', () => {
  return {
    aiStudioClient: {
      analyzeCode: jest.fn(),
    },
  };
});

// Mock Toast context to prevent missing provider errors
jest.mock('../../../src/components/ui/toast', () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

describe('AnalyzePage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('powinien wyrenderować formularz z polem tekstowym, wybiorem języka i przyciskiem analizy', () => {
    render(<AnalyzePage />);

    expect(screen.getByText('Analizator i Audytor')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/wklej dowolny fragment kodu/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /uruchom analizę kodu/i })).toBeInTheDocument();
  });

  it('powinien zgłosić komunikat toast, jeśli przycisk analizy zostanie kliknięty z pustym kodem', () => {
    render(<AnalyzePage />);

    const submitBtn = screen.getByRole('button', { name: /uruchom analizę kodu/i });
    fireEvent.click(submitBtn);

    expect(aiStudioClient.analyzeCode).not.toHaveBeenCalled();
  });

  it('powinien wywołać aiStudioClient.analyzeCode po wpisaniu kodu i kliknięciu przycisku', async () => {
    const mockResult = {
      errors: ['Brak typu zwracanego w funkcji.'],
      suggestions: ['Dodaj typ zwracany : number do nagłówka funkcji.'],
    };

    (aiStudioClient.analyzeCode as jest.Mock).mockResolvedValueOnce(mockResult);

    render(<AnalyzePage />);

    const textarea = screen.getByPlaceholderText(/wklej dowolny fragment kodu/i);
    fireEvent.change(textarea, { target: { value: 'function calc(a, b) { return a + b; }' } });

    const submitBtn = screen.getByRole('button', { name: /uruchom analizę kodu/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(aiStudioClient.analyzeCode).toHaveBeenCalledWith(
        'function calc(a, b) { return a + b; }',
        'typescript'
      );
    });

    expect(await screen.findByText('Brak typu zwracanego w funkcji.')).toBeInTheDocument();
    expect(screen.getByText('Dodaj typ zwracany : number do nagłówka funkcji.')).toBeInTheDocument();
  });
});
