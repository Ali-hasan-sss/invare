import { NextResponse } from "next/server";
import admin from "firebase-admin";
import path from "path";
import fs from "fs";

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    // Load service account credentials
    const serviceAccountPath = path.join(
      process.cwd(),
      "invare-sa-660e4-firebase-adminsdk-fbsvc-0aebbce22b.json"
    );

    let serviceAccount;
    try {
      const serviceAccountFile = fs.readFileSync(serviceAccountPath, "utf8");
      serviceAccount = JSON.parse(serviceAccountFile);
    } catch (error) {
      console.error("Error reading service account file:", error);
      throw new Error("Service account configuration not found");
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, deviceToken } = body;

    if (!topic || typeof topic !== "string") {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    if (!deviceToken || typeof deviceToken !== "string") {
      return NextResponse.json(
        { error: "Device token is required" },
        { status: 400 }
      );
    }

    // Subscribe to topic using Firebase Admin SDK
    const response = await admin
      .messaging()
      .subscribeToTopic([deviceToken], topic);

    if (response.errors && response.errors.length > 0) {
      console.error("Firebase subscription errors:", response.errors);
      return NextResponse.json(
        {
          error: "Failed to subscribe to topic",
          message: response.errors[0].error || "Unknown error",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully subscribed to topic: ${topic}`,
      response: {
        successCount: response.successCount,
        failureCount: response.failureCount,
      },
    });
  } catch (error: any) {
    console.error("Error subscribing to topic:", error);
    return NextResponse.json(
      {
        error: "Failed to subscribe to topic",
        message: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
