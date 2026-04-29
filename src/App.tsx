import { useState } from 'react';
import IPadApp from './ipad/IPadApp';
import AdminApp from './admin/AdminApp';
import { Tablet, Settings } from 'lucide-react';

type Tab = 'ipad' | 'admin';

export default function App() {
  const [tab, setTab] = useState<Tab>('ipad');

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Tab bar */}
      <div className="flex-shrink-0 flex items-center bg-gray-900 border-b border-gray-800 px-4 py-1.5 gap-2 z-50">
        <button
          onClick={() => setTab('ipad')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'ipad'
              ? 'bg-[#0d1b3e] text-[#c9a84c] shadow-lg'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          }`}
        >
          <Tablet size={16} />
          iPad App
        </button>
        <button
          onClick={() => setTab('admin')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'admin'
              ? 'bg-slate-800 text-amber-400 shadow-lg'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          }`}
        >
          <Settings size={16} />
          Quản trị viên
        </button>
        <div className="ml-auto text-gray-600 text-xs">Xuân Hiếu Jewelry System</div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {/* iPad tab - wrapped in realistic iPad frame */}
        <div className={`h-full ${tab === 'ipad' ? 'flex' : 'hidden'} items-center justify-center ipad-stage`}>

          {/* The iPad device */}
          <div className="ipad-device">
            {/* Volume buttons */}
            <div className="ipad-btn ipad-vol-up" />
            <div className="ipad-btn ipad-vol-down" />
            {/* Power button */}
            <div className="ipad-btn ipad-power" />

            {/* Screen */}
            <div className="ipad-screen-bezel">
              <div className="ipad-screen-glass">
                <IPadApp />
                {/* Glass reflection overlay */}
                <div className="ipad-glass-shine" />
              </div>
            </div>
          </div>

        </div>

        {/* Admin tab */}
        <div className={`h-full ${tab === 'admin' ? 'block' : 'hidden'}`}>
          <AdminApp />
        </div>
      </div>
    </div>
  );
}
