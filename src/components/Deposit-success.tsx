export default function DepositSuccess() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold text-green-500">Deposit Successful!</h1>
      <p className="mt-4 text-lg">Your deposit has been processed.</p>

      <a
        href="/account"
        className="mt-6 inline-block bg-blue-600 text-white px-4 py-2 rounded"
      >
        Go back to Account
      </a>
    </div>
  );
}
