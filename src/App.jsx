import { useEffect } from 'react';
import { useReducer } from 'react';

// Локальные данные вместо API
const initialCandidates = [
  { id: "1", name: "Alice", votes: 0 },
  { id: "2", name: "Bob", votes: 0 },
  { id: "3", name: "Charlie", votes: 0 },
  { id: "4", name: "Eve", votes: 0 },
  { id: "5", name: "Dave", votes: 0 },
  { id: "6", name: "Carol", votes: 0 },
  { id: "7", name: "John", votes: 0 }
];

const initialState = {
  candidates: [],
  newCandidate: [],
  status: 'loading',
};
function reducer(state, action) {
  switch (action.type) {
    case 'dataReceived': {
      return { ...state, candidates: action.payload, status: 'ready' };
    }
    case 'dataFailed': {
      return { ...state, status: 'error' };
    }
    case 'reset_votes': {
      return {
        ...state,
        candidates: state.candidates.map((candidate) => ({
          ...candidate,
          votes: 0,
        })),
      };
    }
    case 'update_new_candidate': {
      return {
        ...state,
        newCandidate: action.payload,
      };
    }
    case 'add_candidate': {
      if (
        !action.payload?.trim() ||
        action.payload.length < 1 ||
        state.candidates.some(
          (candidate) =>
            candidate.name.toLowerCase() ===
            action.payload.toLowerCase().trim(),
        )
      ) {
        return state;
      }

      return {
        ...state,
        candidates: [
          ...state.candidates,
          { id: crypto.randomUUID(), name: action.payload, votes: 0 },
        ],
        newCandidate: '',
      };
    }
    case 'vote_plus': {
      return voteInc(state, action.payload);
    }

    case 'vote_minus': {
      return voteDecr(state, action.payload);
    }

    default:
      return state;
  }
}

function voteInc(state, name) {
  return {
    ...state,
    candidates: state.candidates.map((candidate) =>
      candidate.name === name
        ? { ...candidate, votes: candidate.votes + 1 }
        : candidate,
    ),
  };
}
function voteDecr(state, name) {
  return {
    ...state,
    candidates: state.candidates.map((candidate) =>
      candidate.name === name
        ? { ...candidate, votes: Math.max(candidate.votes - 1, 0) }
        : candidate,
    ),
  };
}
function VoteTracker() {
  // If status is "ready", render main content
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // Имитация загрузки данных с задержкой для реалистичности
    const timer = setTimeout(() => {
      try {
        dispatch({ type: 'dataReceived', payload: initialCandidates });
      } catch (err) {
        dispatch({ type: 'dataFailed' });
      }
    }, 500);
    
    return () => clearTimeout(timer);
    
    // Закомментированный код для fetch API (для локальной разработки)
    /*
    async function fetchData() {
      try {
        const res = await fetch('http://localhost:9000/candidates');
        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await res.json();
        dispatch({ type: 'dataReceived', payload: data });
      } catch (err) {
        dispatch({ type: 'dataFailed' });
      }
    }
    fetchData();
    */
  }, []);

  if (state.status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading data, please wait...</p>
        </div>
      </div>
    );
  }
  
  if (state.status === 'error') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center text-red-500">
          <i className="fas fa-exclamation-triangle text-5xl"></i>
          <p className="mt-4 text-lg">Failed to get data. Please try again</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Vote Tracker</h1>
        <p className="text-gray-600">Track and manage votes for candidates</p>
      </header>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Candidates</h2>
        <ul className="space-y-3">
          {state.candidates.map((candidate) => (
            <li 
              key={candidate.id} 
              className="candidate-item flex items-center justify-between p-3 border rounded-md"
            >
              <div>
                <span className="font-medium">{candidate.name}</span>
                <span className="ml-2 text-gray-500">{candidate.votes} votes</span>
              </div>
              <div className="flex space-x-2">
                <button
                  className="btn bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                  onClick={() =>
                    dispatch({ type: 'vote_plus', payload: candidate.name })
                  }
                >
                  <i className="fas fa-plus"></i>
                </button>
                <button
                  className="btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  onClick={() =>
                    dispatch({ type: 'vote_minus', payload: candidate.name })
                  }
                  disabled={candidate.votes === 0}
                >
                  <i className="fas fa-minus"></i>
                </button>
              </div>
            </li>
          ))}
        </ul>
        
        <button 
          className="btn mt-6 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded font-medium"
          onClick={() => dispatch({ type: 'reset_votes' })}
        >
          <i className="fas fa-redo mr-2"></i>
          Reset All Votes
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Add New Candidate</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Enter candidate name"
            value={state.newCandidate}
            onChange={(e) =>
              dispatch({ type: 'update_new_candidate', payload: e.target.value })
            }
            className="flex-1 border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            className="btn bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium"
            onClick={() =>
              dispatch({ type: 'add_candidate', payload: state.newCandidate })
            }
          >
            <i className="fas fa-plus mr-2"></i>
            Add
          </button>
        </div>
      </div>
      
      <footer className="footer text-center">
        <a>
          <p className="text-center text-gray-400">&copy; Dmitrii Goldobin</p>
        </a>
        <a
          href="https://github.com/PixelShino"
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-2"
        >
          <p className="text-center text-gray-400">
            <i className="fab fa-github"></i> GitHub
          </p>
        </a>
        <a
          href="https://t.me/PixelShino"
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-2"
        >
          <p className="text-center text-gray-400">
            <i className="fab fa-telegram"></i> Telegram
          </p>
        </a>
      </footer>
    </div>
  );
}

export default VoteTracker;