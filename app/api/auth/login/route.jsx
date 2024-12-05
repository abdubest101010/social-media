export async function POST(req) {
  const { email, password } = await req.json();

  // Find the user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return new Response(JSON.stringify({ error: "No user found with this email." }), {
      status: 400,
    });
  }

  // Check if the user is verified
  if (!user.verified) {
    return new Response(
      JSON.stringify({ error: "Your account is not verified. Please verify your email." }),
      { status: 400 }
    );
  }

  // Check if the user is a Google user (no password)
  if (!user.password) {
    return new Response(
      JSON.stringify({ error: "Please log in with Google, as this account is linked with Google." }),
      { status: 400 }
    );
  }

  // Validate password
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return new Response(JSON.stringify({ error: "Incorrect password." }), {
      status: 400,
    });
  }

  // Return user data if authentication is successful
  return new Response(
    JSON.stringify({
      message: "Login successful",
      user: { id: user.id, email: user.email, username: user.username },
    }),
    { status: 200 }
  );
}
