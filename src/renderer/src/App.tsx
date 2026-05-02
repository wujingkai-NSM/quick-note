import { useState, useEffect } from 'react';
import { NoteInput } from './components/NoteInput';
import { StatusIndicator } from './components/StatusIndicator';
import { ListPage } from './pages/ListPage';
import { HelpPage } from './pages/HelpPage';
import { useNote } from './hooks/useNote';
import { extractContentAndCommand } from './utils/commandParser';

function App() {
  const [showList, setShowList] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState<string | undefined>();
  const {
    noteCount,
    status,
    handleCommand,
    handleContent
  } = useNote();

  useEffect(() => {
    const handleShowListPage = () => {
      setSearchKeyword(undefined);
      setShowList(true);
      setShowHelp(false);
    };

    const handleShowHelpPage = () => {
      setShowHelp(true);
      setShowList(false);
    };

    const handleShowMainPage = () => {
      setShowList(false);
      setShowHelp(false);
    };

    const unsubscribeListPage = window.quickNote.app.onShowListPage(handleShowListPage);
    const unsubscribeHelpPage = window.quickNote.app.onShowHelpPage(handleShowHelpPage);
    const unsubscribeMainPage = window.quickNote.app.onShowMainPage(handleShowMainPage);

    return () => {
      unsubscribeListPage?.();
      unsubscribeHelpPage?.();
      unsubscribeMainPage?.();
    };
  }, []);

  const handleSubmit = (content: string, noteId?: string) => {
    const { content: cleanedContent, command } = extractContentAndCommand(content);
    
    if (command) {
      handleCommand(command.command, command.args, cleanedContent);
    } else {
      handleContent(content, noteId);
      setShowList(false);
    }
  };

  const handleCommandWrapper = async (command: string, args: string, content: string) => {
    if (command === '/list') {
      setSearchKeyword(undefined);
      setShowList(true);
      setShowHelp(false);
    } else if (command === '/search') {
      setSearchKeyword(args);
      setShowList(true);
      setShowHelp(false);
    } else if (command === '/help') {
      setShowHelp(true);
      setShowList(false);
    } else {
      await handleCommand(command, args, content);
      setShowList(false);
    }
  };

  const handleBack = () => {
    setShowList(false);
    setShowHelp(false);
  };

  const handleNoteSelect = () => {
    setShowList(false);
  };

  if (showHelp) {
    return (
      <div className="app-container">
        <div className="main-window help-window">
          <HelpPage onBack={handleBack} />
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className={`main-window ${showList ? 'list-expanded' : ''}`}>
        <NoteInput
          onSubmit={handleSubmit}
          onCommand={handleCommandWrapper}
          noteCount={noteCount}
        />
        <StatusIndicator status={status} />
        
        {showList && (
          <div className="list-section">
            <ListPage 
              searchKeyword={searchKeyword} 
              onBack={handleBack}
              onNoteSelect={handleNoteSelect}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
