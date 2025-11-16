import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <main className="flex flex-col items-center justify-center flex-1 px-4 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to <span className="text-blue-500">Expense Tracker</span>
        </h1>

        <p className="mt-3 text-2xl">
          Your personal finance companion
        </p>

        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
          <Link href="/login" className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-blue-500 focus:text-blue-500 bg-gray-800 border-gray-700">
            <h3 className="text-2xl font-bold">Login &rarr;</h3>
            <p className="mt-4 text-xl">
              Access your account and manage your expenses.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
