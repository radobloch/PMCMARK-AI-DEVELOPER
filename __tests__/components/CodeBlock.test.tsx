import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CodeBlock } from '../../src/components/ui/code-block';

describe('CodeBlock Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('powinien poprawnie wyrenderować podany kod oraz numery linii', () => {
    const codeSample = 'const x = 10;\nconst y = 20;\nconsole.log(x + y);';

    render(<CodeBlock code={codeSample} language="typescript" showLineNumbers={true} />);

    expect(screen.getByText('const x = 10;')).toBeInTheDocument();
    expect(screen.getByText('const y = 20;')).toBeInTheDocument();
    expect(screen.getByText('console.log(x + y);')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('powinien wyświetlić nazwę pliku i język w nagłówku, gdy przekazano `filename`', () => {
    render(<CodeBlock code="const a = 1;" filename="App.tsx" language="typescript" />);

    expect(screen.getByText('App.tsx')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('powinien skopiować kod do schowka po kliknięciu przycisku Kopiuj', async () => {
    const codeSample = 'function test() { return true; }';

    render(<CodeBlock code={codeSample} filename="test.ts" />);

    const copyButton = screen.getByRole('button', { name: /kopiuj/i });
    expect(copyButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(codeSample);
    expect(screen.getByText('Skopiowano')).toBeInTheDocument();
  });
});
