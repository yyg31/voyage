import { useState } from 'react';
import { Tag } from '../components/Tag';

interface Phrase {
  english: string;
  local: string;
  phonetic: string;
}

interface LanguageSection {
  key: string;
  language: string;
  usedIn: string;
  color: string;
  phrases: Phrase[];
}

const SECTIONS: LanguageSection[] = [
  {
    key: 'vi',
    language: 'Vietnamese',
    usedIn: 'Ho Chi Minh, Con Dao',
    color: '#f59e0b',
    phrases: [
      { english: 'Hello', local: 'Xin chào', phonetic: 'sin chow' },
      { english: 'Goodbye', local: 'Tạm biệt', phonetic: 'tam byet' },
      { english: 'Thank you', local: 'Cảm ơn', phonetic: 'gam uhn' },
      { english: 'Please', local: 'Làm ơn', phonetic: 'lam uhn' },
      { english: 'Yes', local: 'Dạ', phonetic: 'ya' },
      { english: 'No', local: 'Không', phonetic: 'khohng' },
      { english: 'Excuse me / Sorry', local: 'Xin lỗi', phonetic: 'sin loy' },
      { english: 'How much is it?', local: 'Bao nhiêu tiền?', phonetic: 'bao nyew tee-en' },
      { english: 'Delicious', local: 'Ngon', phonetic: 'ngawn' },
      { english: 'Cheers!', local: 'Một, hai, ba, dô!', phonetic: 'moht, high, bah, zoh' },
    ],
  },
  {
    key: 'km',
    language: 'Khmer (Cambodian)',
    usedIn: 'Phnom Penh',
    color: '#16a34a',
    phrases: [
      { english: 'Hello', local: 'សួស្តី', phonetic: 'soo-a-sdai' },
      { english: 'Goodbye', local: 'លាហើយ', phonetic: 'lee-ah high' },
      { english: 'Thank you', local: 'អរគុណ', phonetic: 'ar-koon' },
      { english: 'Please', local: 'សូម', phonetic: 'sohm' },
      { english: 'Yes', local: 'បាទ / ចាស', phonetic: 'baht (m) / chah (f)' },
      { english: 'No', local: 'ទេ', phonetic: 'teh' },
      { english: 'Excuse me / Sorry', local: 'សុំទោស', phonetic: 'sohm toh' },
      { english: 'How much is it?', local: 'ថ្លៃប៉ុន្មាន?', phonetic: 'tlai pon-mahn' },
      { english: 'Delicious', local: 'ឆ្ងាញ់', phonetic: 'ch-ngeye' },
      { english: 'Cheers!', local: 'ជល់មួយ!', phonetic: 'chol moo-ee' },
    ],
  },
  {
    key: 'zh',
    language: 'Mandarin Chinese',
    usedIn: 'Beijing',
    color: '#7c3aed',
    phrases: [
      { english: 'Hello', local: '你好', phonetic: 'nee how' },
      { english: 'Goodbye', local: '再见', phonetic: 'dzeye-jyen' },
      { english: 'Thank you', local: '谢谢', phonetic: 'shyeh-shyeh' },
      { english: 'Please', local: '请', phonetic: 'ching' },
      { english: 'Yes', local: '是', phonetic: 'shr' },
      { english: 'No', local: '不是', phonetic: 'boo-shr' },
      { english: 'Excuse me / Sorry', local: '对不起', phonetic: 'dway-boo-chee' },
      { english: 'How much is it?', local: '多少钱？', phonetic: 'dwoh-shao chyen' },
      { english: 'Delicious', local: '好吃', phonetic: 'how-chr' },
      { english: 'Cheers!', local: '干杯', phonetic: 'gan-bay' },
    ],
  },
];

export function PhrasebookPage() {
  const [activeKey, setActiveKey] = useState<string>('all');

  const visibleSections = activeKey === 'all' ? SECTIONS : SECTIONS.filter((s) => s.key === activeKey);

  return (
    <div className="page">
      <h1>Phrasebook</h1>
      <p className="muted">
        30 handy words and phrases for the trip — hello, thank you, goodbye and more, with a rough English
        pronunciation guide. Not official transliterations, just enough to be understood (and appreciated!).
      </p>

      <div className="filters">
        <button className={activeKey === 'all' ? 'active-chip' : 'chip'} onClick={() => setActiveKey('all')}>
          All languages
        </button>
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            className={activeKey === s.key ? 'active-chip' : 'chip'}
            onClick={() => setActiveKey(s.key)}
          >
            {s.language}
          </button>
        ))}
      </div>

      {visibleSections.map((section) => (
        <section key={section.key}>
          <div className="section-header">
            <h2>{section.language}</h2>
            <Tag label={`Used in: ${section.usedIn}`} color={section.color} outline />
          </div>
          <div className="phrase-grid">
            {section.phrases.map((p) => (
              <div key={p.english} className="card phrase-card" style={{ borderTopColor: section.color }}>
                <div className="phrase-english">{p.english}</div>
                <div className="phrase-local">{p.local}</div>
                <div className="phrase-phonetic muted">/{p.phonetic}/</div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
