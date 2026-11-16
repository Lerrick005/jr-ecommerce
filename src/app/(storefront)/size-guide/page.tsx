export const metadata = { title: "Size Guide" };

export default function SizeGuidePage() {
  return (
    <div className="jr-container py-16 max-w-2xl">
      <p className="jr-eyebrow text-gold">Size guide</p>
      <h1 className="jr-heading-xl mt-3">Find your perfect fit</h1>

      <div className="mt-10 space-y-8 text-sm">
        <div>
          <h2 className="jr-heading-lg text-lg">Women&apos;s clothing</h2>
          <table className="mt-3 w-full border border-line text-left text-sm">
            <thead className="bg-ivory text-[10px] uppercase text-muted">
              <tr>
                <th className="p-2 border-r border-line">Size</th>
                <th className="p-2 border-r border-line">Chest (cm)</th>
                <th className="p-2 border-r border-line">Waist (cm)</th>
                <th className="p-2">Hips (cm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              <tr><td className="p-2 border-r border-line">XS</td><td className="p-2 border-r border-line">80â€"84</td><td className="p-2 border-r border-line">62â€"66</td><td className="p-2">88â€"92</td></tr>
              <tr><td className="p-2 border-r border-line">S</td><td className="p-2 border-r border-line">84â€"88</td><td className="p-2 border-r border-line">66â€"70</td><td className="p-2">92â€"96</td></tr>
              <tr><td className="p-2 border-r border-line">M</td><td className="p-2 border-r border-line">88â€"92</td><td className="p-2 border-r border-line">70â€"74</td><td className="p-2">96â€"100</td></tr>
              <tr><td className="p-2 border-r border-line">L</td><td className="p-2 border-r border-line">92â€"96</td><td className="p-2 border-r border-line">74â€"78</td><td className="p-2">100â€"104</td></tr>
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="jr-heading-lg text-lg">Men&apos;s clothing</h2>
          <table className="mt-3 w-full border border-line text-left text-sm">
            <thead className="bg-ivory text-[10px] uppercase text-muted">
              <tr>
                <th className="p-2 border-r border-line">Size</th>
                <th className="p-2 border-r border-line">Chest (cm)</th>
                <th className="p-2">Waist (cm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              <tr><td className="p-2 border-r border-line">S</td><td className="p-2 border-r border-line">88â€"92</td><td className="p-2">74â€"78</td></tr>
              <tr><td className="p-2 border-r border-line">M</td><td className="p-2 border-r border-line">92â€"96</td><td className="p-2">78â€"82</td></tr>
              <tr><td className="p-2 border-r border-line">L</td><td className="p-2 border-r border-line">96â€"100</td><td className="p-2">82â€"86</td></tr>
              <tr><td className="p-2 border-r border-line">XL</td><td className="p-2 border-r border-line">100â€"104</td><td className="p-2">86â€"90</td></tr>
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="jr-heading-lg text-lg">Shoes</h2>
          <p className="mt-2 text-muted">
            Our shoes use standard EU sizing (39, 40, 41, etc.). If you&apos;re between sizes, we recommend
            sizing up. Contact us on WhatsApp if unsure.
          </p>
        </div>

        <div className="border border-line bg-surface p-4">
          <p className="jr-eyebrow mb-2">How to measure</p>
          <p className="text-muted">
            Use a soft measuring tape. Chest: around the fullest part. Waist: at the narrowest point.
            Hips: around the fullest part of your hips. Measure over your underwear, not over clothes.
          </p>
        </div>
      </div>
    </div>
  );
}