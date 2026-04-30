import { useEffect, useState } from 'react';
import { NoteInput } from './components/NoteInput';
import { CommandMenu } from './components/CommandMenu';
import { StatusIndicator } from './components/StatusIndicator';
import { ListPage } from './pages/ListPage';
import { useNote } from './hooks/useNote';
import { extractContentAndCommand } from './utils/commandParser';

function App() {
  const [currentPage, setCurrentPage] = useState<'main' | 'list'>('main');
  const {
    noteCount,
    status,
    showHelp,
    commands,
    handleCommand,
    handleContent,
    setShowHelp
  } = useNote();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#list') {
      setCurrentPage('list');
    }

    const handleHashChange = () => {
      const newHash = window.location.hash;
      setCurrentPage(newHash === '#list' ? 'list' : 'main');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowHelp(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setShowHelp]);

  const handleSubmit = (content: string) => {
    const { content: cleanedContent, command } = extractContentAndCommand(content);
    
    if (command) {
      handleCommand(command.command, command.args, cleanedContent);
    } else {
      handleContent(content);
    }
  };

  const handleCommandWrapper = async (command: string, args: string, content: string) => {
    if (command === '/list' || command === '/search') {
      window.quickNote.app.showList();
      window.quickNote.app.minimize();
    } else {
      await handleCommand(command, args, content);
    }
  };

  if (currentPage === 'list') {
    return (
      <div className="app-container">
        <div className="main-window list-window">
          <ListPage />
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="main-window">
        <NoteInput
          onSubmit={handleSubmit}
          onCommand={handleCommandWrapper}
          noteCount={noteCount}
        />
        <StatusIndicator status={status} />
        
        {showHelp && (
          <CommandMenu commands={commands} />
        )}
      </div>
    </div>
  );
}

export default App;
