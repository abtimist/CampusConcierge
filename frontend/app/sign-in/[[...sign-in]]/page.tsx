import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white">
                        🎯 Missed Opportunity Detector
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Sign in to discover and track your opportunities
                    </p>
                </div>
                <SignIn
                    appearance={{
                        elements: {
                            card: "bg-gray-900 border border-gray-800 shadow-2xl",
                            headerTitle: "text-white",
                            headerSubtitle: "text-gray-400",
                            socialButtonsBlockButton:
                                "bg-gray-800 border border-gray-700 text-white hover:bg-gray-700",
                            formFieldInput:
                                "bg-gray-800 border-gray-700 text-white placeholder-gray-500",
                            formButtonPrimary:
                                "bg-violet-600 hover:bg-violet-700 text-white",
                            footerActionLink: "text-violet-400 hover:text-violet-300",
                        },
                    }}
                />
            </div>
        </main>
    );
}
