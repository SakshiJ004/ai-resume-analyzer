const Loader = ({ text = 'Loading...' }) => {
    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
            <p className="text-gray-400 text-sm">{text}</p>
        </div>
    );
};

export default Loader;