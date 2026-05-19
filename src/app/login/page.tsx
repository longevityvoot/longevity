import { signIn } from "@/auth";
import { FlowerHero } from "@/components/FlowerHero";

type SearchParams = Promise<{ from?: string; error?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { from = "/", error } = await searchParams;
  const googleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const lineConfigured = !!(process.env.LINE_CHANNEL_ID && process.env.LINE_CHANNEL_SECRET);

  return (
    <main className="min-h-screen bg-canvas flex items-start justify-center px-5 pt-10 pb-10">
      <div className="w-full max-w-[360px]">
        <div className="flex flex-col items-center text-center">
          <FlowerHero size={240} />
          <h1 className="mt-3 text-[26px] font-bold tracking-tight text-ink leading-tight">
            Longevity Designer
          </h1>
          <p className="mt-2 text-[13px] text-ink-3 max-w-[300px]">
            ดูแลสุขภาพระยะยาว · ระบบติดตาม 6 ด้านโดย designer ส่วนตัวของคุณ
          </p>
        </div>

        {error ? (
          <p className="mt-6 text-[13px] text-danger text-center bg-pillar-activity-wash py-2 rounded-md">
            เข้าสู่ระบบไม่สำเร็จ ลองอีกครั้ง
          </p>
        ) : null}

        <div className="mt-8 space-y-3">
          {googleConfigured ? (
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: from });
              }}
            >
              <button
                type="submit"
                className="w-full h-12 rounded-md border border-border-strong bg-surface font-semibold text-[14px] text-ink-2 flex items-center justify-center gap-2"
              >
                <GoogleIcon />
                เข้าสู่ระบบด้วย Google
              </button>
            </form>
          ) : null}

          {lineConfigured ? (
            <form
              action={async () => {
                "use server";
                await signIn("line", { redirectTo: from });
              }}
            >
              <button
                type="submit"
                className="w-full h-12 rounded-md bg-[#06C755] text-white font-semibold text-[14px] flex items-center justify-center gap-2"
              >
                <LineIcon />
                เข้าสู่ระบบด้วย LINE
              </button>
            </form>
          ) : (
            <button
              type="button"
              disabled
              className="w-full h-12 rounded-md bg-[#06C755] text-white font-semibold text-[14px] opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
              title="LINE Login รอ env var"
            >
              <LineIcon />
              เข้าสู่ระบบด้วย LINE (เร็วๆนี้)
            </button>
          )}
        </div>

        <div className="mt-6 relative">
          <div className="absolute inset-y-1/2 inset-x-0 border-t border-border" />
          <p className="relative bg-canvas inline-block px-3 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-wider text-ink-4 font-semibold">
            หรือ
          </p>
        </div>

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
            <span className="text-[11px] uppercase tracking-wider text-ink-4 font-semibold">
              อีเมล
            </span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 w-full h-12 rounded-md border border-border-strong px-3 text-[15px]"
            />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-wider text-ink-4 font-semibold">
              รหัสผ่าน
            </span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 w-full h-12 rounded-md border border-border-strong px-3 text-[15px]"
            />
          </label>
          <button
            type="submit"
            className="w-full h-12 rounded-md bg-ink text-white font-semibold text-[15px]"
          >
            เข้าสู่ระบบด้วยอีเมล
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-ink-4">
          ยังไม่มี account — designer จะส่ง invite ทาง LINE
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 5.04c1.71 0 3.24.59 4.45 1.74l3.32-3.32C17.74 1.46 15.07.4 12 .4 7.27.4 3.2 3.07 1.24 6.97l3.87 3c.93-2.79 3.53-4.93 6.89-4.93z"
      />
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.8-.07-1.58-.21-2.33H12v4.4h6.46c-.28 1.49-1.12 2.75-2.39 3.6l3.7 2.87c2.16-2 3.42-4.94 3.42-8.54z"
      />
      <path
        fill="#FBBC05"
        d="M5.11 13.97c-.23-.69-.36-1.43-.36-2.2s.13-1.51.36-2.2L1.24 6.57C.45 8.14 0 9.92 0 11.77s.45 3.63 1.24 5.2l3.87-3z"
      />
      <path
        fill="#34A853"
        d="M12 23.14c3.07 0 5.66-1.01 7.54-2.76l-3.7-2.87c-1.03.69-2.34 1.1-3.84 1.1-3.36 0-6.21-2.27-7.22-5.34l-3.87 3c1.96 3.9 6.03 6.87 11.09 6.87z"
      />
    </svg>
  );
}

function LineIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.282.629-.631.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .272-.18.515-.448.596-.064.018-.133.029-.199.029-.211 0-.391-.082-.51-.241l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.029.135-.031.194-.031.195 0 .375.105.495.244l2.462 3.319V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}
