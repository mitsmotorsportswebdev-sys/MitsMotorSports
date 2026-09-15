import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

import {
    filterAllowedFields,
    getUploadDirectory,
    isSafePageName,
    isValidObjectId,
} from "../utils/security.js";

import {
    createAuthToken,
    requireAdmin,
    verifyToken,
} from "../middleware/auth.js";

test("filterAllowedFields strips unexpected fields", () => {
    const result = filterAllowedFields(
        { title: "Home", content: "Hi", role: "admin", _id: "danger" },
        ["title", "content"],
    );

    assert.deepEqual(result, { title: "Home", content: "Hi" });
});

test("invalid ObjectIds are rejected", () => {
    assert.equal(isValidObjectId("not-a-valid-id"), false);
    assert.equal(isValidObjectId("64d5e73a8d2d1d2c9aa0c01a"), true);
});

test("unsafe page names are rejected", () => {
    assert.equal(isSafePageName("../etc/passwd"), false);
    assert.equal(isSafePageName("home"), true);
    assert.equal(isSafePageName("projects/aethon"), false);
});

test("upload directory names are bounded to the allowed page list", () => {
    assert.equal(getUploadDirectory("sponsors"), "uploads/sponsors");
    assert.equal(getUploadDirectory("../admin"), null);
});

test("JWT creation and verification work with expiration checks", async () => {
    process.env.JWT_SECRET = "test-secret";

    const token = createAuthToken({ id: "user-123", role: "admin" }, "1000ms");
    const payload = verifyToken(token);

    assert.equal(payload.id, "user-123");
    assert.equal(payload.role, "admin");

    await assert.rejects(async () => {
        const expiredToken = jwt.sign(
            { id: "user-99", role: "admin" },
            process.env.JWT_SECRET,
            {
                expiresIn: "-1s",
            },
        );
        verifyToken(expiredToken);
    }, /expired|jwt expired/i);
});

test("requireAdmin denies non-admin users", () => {
    const req = {
        headers: {
            authorization: `Bearer ${
                createAuthToken({ id: "user-1", role: "user" })
            }`,
        },
    };

    const res = {
        statusCode: 200,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.payload = payload;
            return this;
        },
    };

    let nextCalled = false;
    const next = () => {
        nextCalled = true;
    };

    requireAdmin(req, res, next);

    assert.equal(res.statusCode, 403);
    assert.equal(nextCalled, false);
});
