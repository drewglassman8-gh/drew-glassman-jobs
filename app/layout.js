export const metadata = {
  title: "Drew Glassman Jobs",
  description: "Drew Glassman's job search dashboard — Indiana University, Kelley School of Business",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
