import { useEffect, useState } from 'react';
import { NoteInput } from './components/NoteInput';
import { StatusIndicator } from './components/StatusIndicator';
import { ListPage } from './pages/ListPage';
import { HelpPage } from './pages/HelpPage';
import { useNote } from './hooks/useNote';
import { extractContentAndCommand } from './utils/commandParser';

function App() {
  const [currentPage, setCurrentPage] = useState<'main' | 'list' | 'help'>('main');
  const {
    noteCount,
    status,
    handleCommand,
    handleContent
  } = useNote();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#list') {
      setCurrentPage('list');
    } else if (hash === '#help') {
      setCurrentPage('help');
    }

    const handleHashChange = () => {
      const newHash = window.location.hash;
      if (newHash === '#list') {
        setCurrentPage('list');
      } else if (newHash === '#help') {
        setCurrentPage('help');
      } else {
        setCurrentPage('main');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSubmit = (content: string, noteId?: string) => {
    console.log('handleSubmit called:', { content, noteId });
    const { content: cleanedContent, command } = extractContentAndCommand(content);
    
    if (command) {
      handleCommand(command.command, command.args, cleanedContent);
    } else {
      handleContent(content, noteId);
    }
  };

  const handleCommandWrapper = async (command: string, args: string, content: string) => {
    if (command === '/list' || command === '/search') {
      window.quickNote.app.showList();
      window.quickNote.app.minimize();
    } else if (command === '/help') {
      window.quickNote.app.showHelp();
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

  if (currentPage === 'help') {
    return (
      <div className="app-container">
        <div className="main-window help-window">
          <HelpPage />
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
      </div>
    </div>
  );
}

export default App;
