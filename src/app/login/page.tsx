import { signIn } from "@/auth";

type SearchParams = Promise<{ from?: string; error?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { from = "/", error } = await searchParams;
  const googleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-10 bg-canvas">
      <div className="w-full max-w-[360px] bg-surface rounded-xl shadow-lg p-6">
        <h1 className="text-[22px] font-semibold tracking-tight">เข้าสู่ระบบ</h1>
        <p className="text-ink-3 text-[13px] mt-1">Longevity Designer</p>

        {error ? (
          <p className="mt-4 text-[13px] text-danger">เข้าสู่ระบบไม่สำเร็จ ลองอีกครั้ง</p>
        ) : null}

        <form
          action={async (formData) => {
            "use server";
            await signIn("credentials", {
              email: formData.get("email"),
              password: formData.get("password"),
              redirectTo: from,
            });
          }}
          className="mt-6 space-y-3"
        >
          <label className="block">
            <span className="text-[12px] text-ink-3 font-semibold">อีเมล</span>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[15px]"
            />
          </label>
          <label className="block">
            <span className="text-[12px] text-ink-3 font-semibold">รหัสผ่าน</span>
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[15px]"
            />
          </label>
          <button
            type="submit"
            className="w-full h-12 rounded-md bg-ink text-white font-semibold text-[15px]"
          >
            เข้าสู่ระบบ
          </button>
        </form>

        {googleConfigured ? (
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: from });
            }}
            className="mt-3"
          >
            <button
              type="submit"
              className="w-full h-12 rounded-md border border-border-strong bg-surface font-semibold text-[15px] text-ink-2"
            >
              เข้าสู่ระบบด้วย Google
            </button>
          </form>
        ) : null}
      </div>
    </main>
  );
}
