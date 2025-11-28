import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { TransactionType, Category, TransactionData } from '../types';
import { ArrowRight, Box, Hash, Clock, ShieldAlert } from 'lucide-react';
import { checkFraudRisk } from '../services/gemini';

const Wallet: React.FC = () => {
  const { user, blocks, addTransaction, isLoading } = useApp();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [fraudCheck, setFraudCheck] = useState<{risk: string, reason: string} | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !recipient) return;

    const val = parseFloat(amount);
    if (val > user.balance) {
        alert("Insufficient balance!");
        return;
    }

    // Pre-transaction Fraud Check Simulation
    const tempTx: any = {
        amount: val,
        type: TransactionType.TRANSFER,
        category: Category.OTHER,
        description: `Transfer to ${recipient}`,
        receiver: recipient
    };

    // If amount is high, trigger check
    if (val > 5000) {
        const check = await checkFraudRisk(tempTx);
        if (check.riskLevel === 'High') {
             if (!confirm(`Warning: High Fraud Risk Detected!\nReason: ${check.reason}\nDo you still want to proceed?`)) {
                 return;
             }
        }
    }

    await addTransaction({
        amount: val,
        type: TransactionType.TRANSFER,
        category: Category.OTHER,
        description: `Transfer to ${recipient}`,
        receiver: recipient
    });

    setRecipient('');
    setAmount('');
    setFraudCheck(null);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Send Money Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
             <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                 <WalletIcon className="text-brand-600" />
                 P2P Transfer
             </h2>
             <form onSubmit={handleSend} className="space-y-4">
                 <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Recipient ID / UPI</label>
                     <input 
                        type="text" 
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                        placeholder="e.g., student@upi"
                        required
                     />
                 </div>
                 <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                     <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                        placeholder="0.00"
                        required
                        min="1"
                     />
                 </div>
                 <button 
                    disabled={isLoading}
                    type="submit" 
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-lg transition-colors flex justify-center items-center gap-2"
                 >
                    {isLoading ? 'Processing Block...' : 'Send Securely'}
                    {!isLoading && <ArrowRight size={18} />}
                 </button>
             </form>
             <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-xs rounded-lg flex gap-2">
                 <ShieldAlert size={16} />
                 <p>Transactions are irreversible and recorded on the local chain.</p>
             </div>
          </div>

          {/* Blockchain Explainer */}
          <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-sm">
              <h3 className="text-lg font-bold mb-3">How SecureFin Works</h3>
              <p className="text-slate-300 text-sm mb-4">
                  Unlike traditional databases, SecureFin uses a blockchain ledger. 
                  Every transaction is a "block" linked to the previous one using cryptographic hashes.
              </p>
              <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-3">
                      <div className="bg-slate-700 p-2 rounded">🔗</div>
                      <span>Immutable: Records cannot be altered.</span>
                  </li>
                  <li className="flex items-center gap-3">
                      <div className="bg-slate-700 p-2 rounded">🛡️</div>
                      <span>Transparent: You can verify the chain below.</span>
                  </li>
                  <li className="flex items-center gap-3">
                      <div className="bg-slate-700 p-2 rounded">🤖</div>
                      <span>Smart: AI monitors for unusual spending.</span>
                  </li>
              </ul>
          </div>
      </div>

      {/* Blockchain Visualization */}
      <div>
          <h2 className="text-xl font-bold mb-4">Blockchain Ledger (Live)</h2>
          <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
              {blocks.slice().reverse().map((block) => (
                  <div key={block.hash} className="snap-start min-w-[300px] bg-white p-5 rounded-xl border-l-4 border-brand-500 shadow-md relative">
                      <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 z-10 bg-slate-200 rounded-full p-1 border-2 border-white">
                         <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-2">
                          <span className="bg-brand-100 text-brand-800 text-xs font-bold px-2 py-1 rounded">Block #{block.index}</span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Clock size={12} />
                              {new Date(block.timestamp).toLocaleTimeString()}
                          </span>
                      </div>

                      <div className="space-y-2 text-xs font-mono text-slate-600 mt-3 break-all">
                          <div>
                              <span className="font-bold text-slate-800 block mb-1">Hash:</span>
                              {block.hash.substring(0, 16)}...
                          </div>
                          <div>
                              <span className="font-bold text-slate-800 block mb-1">Prev Hash:</span>
                              {block.previousHash.substring(0, 16)}...
                          </div>
                          <div className="bg-slate-50 p-2 rounded mt-2 border border-slate-100">
                              <span className="font-bold text-slate-800">Data:</span><br/>
                              {block.data.type}: ₹{block.data.amount}<br/>
                              {block.data.description}
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

// Simple Icon component wrapper to fix specific Lucide import issue if any
const WalletIcon = ({ className }: { className?: string }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
);

export default Wallet;