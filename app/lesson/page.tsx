'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './lesson.module.css';

// Canvas HTML - aligned with intro video script
const CANVAS_HTML = `<!DOCTYPE html><html lang="pt-BR"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Referência</title>
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
  body { display: flex; align-items: center; justify-content: center; background: #ffffff; font-family: system-ui, -apple-system, sans-serif; }
</style>
</head>
<body>
<div style="width: 100%; max-width: 100%; padding: 20px; overflow: hidden;">
  <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">

    <!-- Boas-vindas -->
    <div data-segment="0" style="display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center;">
      <span style="font-size: 28px; line-height: 1;">👋</span>
      <span style="font-size: 18px; font-weight: 700; color: #1B1F5B;">Bem-vindo à Aula Demo</span>
      <span style="font-size: 13px; color: #6b7280;">Vamos aprender programação juntos!</span>
    </div>

    <!-- Sequência da aula -->
    <div data-segment="3" style="width: 100%; display: flex; flex-direction: column; gap: 10px;">
      <div style="background: #F8F8F8; border: 2px solid #e5e7eb; border-radius: 12px; padding: 14px; display: flex; align-items: center; gap: 12px;">
        <div style="width: 36px; height: 36px; background: #FF6A2B; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <span style="font-size: 18px; font-weight: 700; color: white;">1</span>
        </div>
        <div style="flex: 1;">
          <span style="font-size: 13px; font-weight: 700; color: #1B1F5B; display: block;">Quiz de Lógica</span>
          <span style="font-size: 11px; color: #6b7280;">Conhecimentos básicos</span>
        </div>
        <span style="font-size: 20px;">📝</span>
      </div>

      <div data-segment="5" style="background: #F8F8F8; border: 2px solid #e5e7eb; border-radius: 12px; padding: 14px; display: flex; align-items: center; gap: 12px;">
        <div style="width: 36px; height: 36px; background: #22C55E; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <span style="font-size: 18px; font-weight: 700; color: white;">2</span>
        </div>
        <div style="flex: 1;">
          <span style="font-size: 13px; font-weight: 700; color: #1B1F5B; display: block;">Compilador Python</span>
          <span style="font-size: 11px; color: #6b7280;">Seu primeiro exercício</span>
        </div>
        <span style="font-size: 20px;">💻</span>
      </div>
    </div>

    <!-- Mensagem de boa prática -->
    <div data-segment="7" style="width: 100%; background: #fff4ee; border: 2px solid #FF6A2B; border-radius: 10px; padding: 12px 14px; text-align: center;">
      <span style="font-size: 14px; color: #FF6A2B; font-weight: 700;">🚀 Boa prática pra você!</span>
    </div>

  </div>
</div>
<script>
(function() {
  var segments = document.querySelectorAll('[data-segment]');
  segments.forEach(function(el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(12px) scale(0.97)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });
  function revealUpTo(cueIndex) {
    segments.forEach(function(el) {
      var seg = parseInt(el.getAttribute('data-segment'), 10);
      if (cueIndex >= seg) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0) scale(1)';
      }
    });
  }
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'cue-update') {
      revealUpTo(e.data.cueIndex);
    }
  });
})();
<\/script>
</body></html>`;

// Video URLs for each step
const STEP_VIDEOS: Record<number, string> = {
  1: 'https://e1g1fjiv2lqcgsrg.public.blob.vercel-storage.com/videos/pt/programacao-do-zero/aula-teste/introducao_teste-1779476149812.mp4',
  3: 'https://e1g1fjiv2lqcgsrg.public.blob.vercel-storage.com/videos/pt/programacao-do-zero/aula-teste/exercicio_print-1779476683781.mp4',
};

export default function LessonPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [currentCueIndex, setCurrentCueIndex] = useState(0);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [runningCode, setRunningCode] = useState(false);
  const [pythonOutput, setPythonOutput] = useState<{
    visible: boolean;
    content: string;
    isError: boolean;
    isSuccess: boolean;
  }>({ visible: false, content: '', isError: false, isSuccess: false });
  const [step3Completed, setStep3Completed] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pyodideWorkerRef = useRef<Worker | null>(null);
  const codeTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize Pyodide worker
  useEffect(() => {
    if (pyodideWorkerRef.current) return;

    console.log('[Pyodide] Initializing worker...');

    try {
      const worker = new Worker('/pyodide-worker.js');
      pyodideWorkerRef.current = worker;

      worker.addEventListener('message', (e) => {
        const msg = e.data;
        console.log('[Pyodide] Message received:', msg.type);

        if (msg.type === 'ready') {
          console.log('[Pyodide] Worker ready!');
          setPyodideReady(true);
        }

        if (msg.type === 'init_error') {
          console.error('[Pyodide] Init error:', msg.message);
        }

        if (msg.type === 'result') {
          handlePythonResult(msg);
        }
      });

      worker.addEventListener('error', (e) => {
        console.error('[Pyodide] Worker error:', e);
      });
    } catch (error) {
      console.error('[Pyodide] Failed to create worker:', error);
    }

    return () => {
      if (pyodideWorkerRef.current) {
        pyodideWorkerRef.current.terminate();
      }
    };
  }, []);

  // Load canvas iframe
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = CANVAS_HTML;
    }
  }, []);

  // Video timeupdate listener
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      let newCueIndex = 0;

      if (currentTime > 3) newCueIndex = 3;  // Quiz appears
      if (currentTime > 7) newCueIndex = 5;  // Compiler appears
      if (currentTime > 11) newCueIndex = 7; // Final message

      if (newCueIndex !== currentCueIndex) {
        setCurrentCueIndex(newCueIndex);
        const iframe = iframeRef.current;
        if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage(
            { type: 'cue-update', cueIndex: newCueIndex },
            '*'
          );
        }
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [currentCueIndex]);

  // Keyboard shortcut (Ctrl+Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && currentStep === 3) {
        e.preventDefault();
        runPython();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, pyodideReady, runningCode]);

  const goToStep = (step: number) => {
    setCurrentStep(step);

    // Change video if this step has a specific video
    if (STEP_VIDEOS[step] && videoRef.current) {
      const video = videoRef.current;
      const currentTime = video.currentTime;
      video.src = STEP_VIDEOS[step];
      video.load();
      // Auto-play if user was already watching
      if (currentTime > 0) {
        video.play().catch(() => {});
      }
    }
  };

  const checkAnswer = (isCorrect: boolean, event: React.MouseEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    if (isCorrect) {
      element.style.background = '#22c55e';
      setTimeout(() => {
        alert('Correto! ✅');
      }, 300);
    } else {
      element.style.background = '#ef4444';
      setTimeout(() => {
        alert('Incorreto. Tente novamente! ❌');
        element.style.background = '#ff6a2b';
      }, 1000);
    }
  };

  const runPython = () => {
    if (runningCode || !pyodideReady || !codeTextareaRef.current) return;

    const code = codeTextareaRef.current.value;
    if (!code.trim()) return;

    setRunningCode(true);
    setPythonOutput({ visible: false, content: '', isError: false, isSuccess: false });

    const id = Date.now();
    pyodideWorkerRef.current?.postMessage({
      type: 'run',
      id,
      code,
      stdin_mock: '',
    });
  };

  const handlePythonResult = (result: any) => {
    setRunningCode(false);

    // Syntax error
    if (result.stderr) {
      setPythonOutput({
        visible: true,
        content: '❌ Erro:\n' + result.stderr,
        isError: true,
        isSuccess: false,
      });
      return;
    }

    // Validate exercise: must display "Olá mundo" or "Olá, mundo"
    const expectedOutputs = ['Olá mundo', 'Olá, mundo', 'olá mundo', 'olá, mundo'];
    const userOutput = (result.stdout || '').trim();
    const isCorrect = expectedOutputs.some((expected) =>
      userOutput.toLowerCase() === expected.toLowerCase()
    );

    if (isCorrect) {
      setPythonOutput({
        visible: true,
        content: '✅ Correto!\n\nSaída:\n' + userOutput,
        isError: false,
        isSuccess: true,
      });
      setStep3Completed(true);
    } else {
      setPythonOutput({
        visible: true,
        content:
          '❌ Incorreto\n\nSua saída:\n' +
          (userOutput || '(vazio)') +
          '\n\nEsperado:\nOlá mundo',
        isError: true,
        isSuccess: false,
      });
    }
  };

  const handleReportSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const report = {
      student_id: '550e8400-e29b-41d4-a716-446655440099',
      lesson_id: '550e8400-e29b-41d4-a716-446655440001',
      // TODO: CANDIDATO DEVE IMPLEMENTAR - Classificação automática no backend
      // O problem_type deve ser extraído da description via ReportClassifier
      description: formData.get('description') as string,
      metadata: {
        current_step: currentStep,
        browser: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
    };

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });

      if (response.ok) {
        setShowSuccess(true);
        form.reset();
        setTimeout(() => {
          setIsReportModalOpen(false);
          setShowSuccess(false);
        }, 2000);
      } else {
        alert('Erro ao enviar report. Tente novamente.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erro ao enviar report. Verifique se o servidor está rodando.');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <p className={styles.breadcrumb}>Lista de cursos</p>
          <h1 className={styles.title}>Lógica de Programação - Módulo 1</h1>
        </div>
        <button
          className={styles.reportBtn}
          onClick={() => setIsReportModalOpen(true)}
        >
          ⚠️ Relatar um problema com esta aula
        </button>
      </header>

      <div className={styles.content}>
        <div className={styles.videoSection}>
          <video ref={videoRef} className={styles.video} controls>
            <source
              src="https://e1g1fjiv2lqcgsrg.public.blob.vercel-storage.com/videos/pt/programacao-do-zero/aula-teste/introducao_teste-1779476149812.mp4"
              type="video/mp4"
            />
            Seu navegador não suporta vídeo.
          </video>

          <div className={styles.stepsList}>
            <div
              className={`${styles.stepItem} ${currentStep === 1 ? styles.active : ''} ${styles.completed}`}
              onClick={() => goToStep(1)}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div className={styles.stepNumber} style={{ background: '#22c55e' }}>
                  1
                </div>
                <div>
                  <div className={styles.stepTitle}>Introdução</div>
                  <div className={styles.stepSubtitle}>Vídeo • Aula Demo</div>
                </div>
              </div>
            </div>

            <div
              className={`${styles.stepItem} ${currentStep === 2 ? styles.active : ''}`}
              onClick={() => goToStep(2)}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div className={styles.stepNumber}>2</div>
                <div>
                  <div className={styles.stepTitle}>Quiz - Conceitos Básicos</div>
                  <div className={styles.stepSubtitle}>Exercício • 2 perguntas</div>
                </div>
              </div>
            </div>

            <div
              className={`${styles.stepItem} ${currentStep === 3 ? styles.active : ''} ${step3Completed ? styles.completed : ''}`}
              onClick={() => goToStep(3)}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div
                  className={styles.stepNumber}
                  style={step3Completed ? { background: '#22c55e' } : {}}
                >
                  3
                </div>
                <div>
                  <div className={styles.stepTitle}>Prática - Comando print()</div>
                  <div className={styles.stepSubtitle}>Código • 3 exercícios</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.interactiveArea}>
          {/* Step 1: Canvas */}
          <div
            className={`${styles.quizContainer} ${currentStep === 1 ? styles.active : ''}`}
          >
            <iframe
              ref={iframeRef}
              sandbox="allow-scripts"
              className={styles.canvasIframe}
              title="Canvas Interativo"
            />
          </div>

          {/* Step 2: Quiz */}
          <div
            className={`${styles.quizContainer} ${currentStep === 2 ? styles.active : ''}`}
          >
            <h2>Quiz - Conceitos Básicos</h2>
            <div style={{ marginTop: '24px' }}>
              <div className={styles.question}>
                1. O que é uma variável em programação?
              </div>
              <div
                className={styles.option}
                onClick={(e) => checkAnswer(false, e)}
              >
                Um tipo de loop que repete código
              </div>
              <div
                className={styles.option}
                onClick={(e) => checkAnswer(true, e)}
              >
                Um espaço na memória para armazenar dados
              </div>
              <div
                className={styles.option}
                onClick={(e) => checkAnswer(false, e)}
              >
                Uma função matemática
              </div>
              <div
                className={styles.option}
                onClick={(e) => checkAnswer(false, e)}
              >
                Um erro no código
              </div>
            </div>

            <div style={{ marginTop: '32px' }}>
              <div className={styles.question}>
                2. Qual é a saída do código: <code>5 + 3 * 2</code>?
              </div>
              <div
                className={styles.option}
                onClick={(e) => checkAnswer(false, e)}
              >
                16
              </div>
              <div
                className={styles.option}
                onClick={(e) => checkAnswer(true, e)}
              >
                11
              </div>
              <div
                className={styles.option}
                onClick={(e) => checkAnswer(false, e)}
              >
                10
              </div>
              <div
                className={styles.option}
                onClick={(e) => checkAnswer(false, e)}
              >
                13
              </div>
            </div>
          </div>

          {/* Step 3: Python Editor */}
          <div
            className={`${styles.canvasContainer} ${currentStep === 3 ? styles.active : ''}`}
          >
            <div className={styles.codeEditor}>
              {/* Header */}
              <div className={styles.editorHeader}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className={styles.dot} style={{ background: '#FF6A2B' }}></span>
                  <span className={styles.dot} style={{ background: '#F59E0B' }}></span>
                  <span className={styles.dot} style={{ background: '#22C55E' }}></span>
                </div>
                <span className={styles.editorTitle}>
                  Python 3 · REPL
                  <span
                    id="pyodide-status"
                    style={{
                      color: pyodideReady ? '#22C55E' : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {pyodideReady ? ' · pronto' : ''}
                  </span>
                </span>
              </div>

              {/* Instruction */}
              <div className={styles.instruction}>
                <p className={styles.instructionTitle}>EXERCÍCIO PRINT()</p>
                <p className={styles.instructionText}>
                  Exiba a mensagem <strong>&quot;Olá mundo&quot;</strong> na tela
                </p>
                <p className={styles.instructionHint}>
                  <strong>Dica:</strong> Use print() com o texto entre aspas
                </p>
              </div>

              {/* Editor */}
              <div className={styles.editorBody}>
                <div className={styles.lineNumbers}>
                  <span>1</span>
                </div>
                <textarea
                  ref={codeTextareaRef}
                  className={styles.textarea}
                  placeholder={'# Digite seu código aqui\nprint("...")'}
                />
              </div>

              {/* Output */}
              {pythonOutput.visible && (
                <div
                  className={`${styles.output} ${pythonOutput.isSuccess ? styles.outputSuccess : pythonOutput.isError ? styles.outputError : ''}`}
                >
                  {pythonOutput.content}
                </div>
              )}

              {/* Footer */}
              <div className={styles.editorFooter}>
                <span className={styles.footerHint}>Ctrl + Enter para executar</span>
                <button
                  className={styles.runBtn}
                  onClick={runPython}
                  disabled={runningCode || !pyodideReady}
                >
                  {runningCode ? (
                    <>
                      <span className={styles.spinner}></span>
                      <span>Executando...</span>
                    </>
                  ) : (
                    <>
                      <span>▶</span>
                      <span>Executar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            {showSuccess && (
              <div className={styles.successMessage}>
                ✅ Problema reportado com sucesso!
              </div>
            )}

            <h2>Reportar Problema</h2>
            <p className={styles.modalDescription}>
              Descreva o problema que você encontrou nesta aula
            </p>

            <form onSubmit={handleReportSubmit}>
              <div className={styles.formGroup}>
                <label>Descreva o problema que você encontrou</label>
                <textarea
                  name="description"
                  required
                  rows={6}
                  placeholder="Ex: O vídeo não carrega e fica travado na tela preta..."
                />
                <p className={styles.hint}>
                  Seja específico para ajudar o sistema a identificar e resolver o problema automaticamente.
                </p>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => {
                    setIsReportModalOpen(false);
                    setShowSuccess(false);
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Enviar Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
