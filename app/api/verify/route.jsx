import prisma from "@/lib/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = decodeURIComponent(searchParams.get("code"));

  if (!code) {
    console.error("Verification code is missing.");
    return new Response(
      JSON.stringify({ message: "Verification code is missing" }),
      { status: 400 }
    );
  }

  try {
    console.log("Code received in API request:", code);

    // Debugging: Log all users with verification codes
    const allUsersWithCode = await prisma.user.findMany({
      where: { verificationCode: { not: null } },
    });
    console.log("All users with verification codes:", allUsersWithCode);

    // Find the user with the given code
    const user = await prisma.user.findUnique({
      where: { verificationCode: code },
    });

    if (!user) {
      console.error("Invalid verification code:", code);
      return new Response(
        JSON.stringify({ message: "Invalid verification code" }),
        { status: 400 }
      );
    }

    if (user.verified) {
      console.log("User is already verified:", user.email);
      return new Response(
        JSON.stringify({ message: "User is already verified." }),
        { status: 200 }
      );
    }

    // Update the user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verified: true,
        verificationCode: null, // Clear verification code
        verifiedAt: new Date(),
      },
    });

    console.log("User successfully verified:", user.id);
    return new Response(
      JSON.stringify({ message: "Email verified successfully!" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during email verification:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      { status: 500 }
    );
  }
}
