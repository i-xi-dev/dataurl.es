import { assertStrictEquals, assertThrows } from "std/testing/asserts";
import { DataURL } from "../mod.ts";

Deno.test("DataURL.Resource.fromString(string)", () => {
  const r0 = DataURL.Resource.fromString("data:text/plain,");
  assertStrictEquals(r0.data.byteLength, 0);
  assertStrictEquals(r0.type, "text/plain");

  const r0b = DataURL.Resource.fromString("data:text/plain;base64,");
  assertStrictEquals(r0b.data.byteLength, 0);
  assertStrictEquals(r0b.type, "text/plain");

  const r1 = DataURL.Resource.fromString("data: ,");
  assertStrictEquals(r1.data.byteLength, 0);
  assertStrictEquals(r1.type, "text/plain;charset=US-ASCII");

  const r2 = DataURL.Resource.fromString("data: ; ,");
  assertStrictEquals(r2.data.byteLength, 0);
  assertStrictEquals(r2.type, "text/plain");

  const r3 = DataURL.Resource.fromString("data: ; x=y ,");
  assertStrictEquals(r3.data.byteLength, 0);
  assertStrictEquals(r3.type, "text/plain;x=y");

  const r4 = DataURL.Resource.fromString("data:text/plain,a1");
  assertStrictEquals(r4.data.byteLength, 2);
  const r4b = new Uint8Array(r4.data);
  assertStrictEquals(r4b.at(0), 97);
  assertStrictEquals(r4b.at(1), 49);
  assertStrictEquals(r4.type, "text/plain");

  const r5 = DataURL.Resource.fromString(
    "data:application/octet-stream;base64,AwIBAP/+/fw=",
  );
  const r5b = new Uint8Array(r5.data);
  assertStrictEquals(r5b.byteLength, 8);
  assertStrictEquals(r5b[0], 3);
  assertStrictEquals(r5b[1], 2);
  assertStrictEquals(r5b[2], 1);
  assertStrictEquals(r5b[3], 0);
  assertStrictEquals(r5b[4], 255);
  assertStrictEquals(r5b[5], 254);
  assertStrictEquals(r5b[6], 253);
  assertStrictEquals(r5b[7], 252);
  assertStrictEquals(r5.type, "application/octet-stream");

  const r6 = DataURL.Resource.fromString("data:text/plain; p1=a,a1");
  assertStrictEquals(r6.data.byteLength, 2);
  const r6b = new Uint8Array(r6.data);
  assertStrictEquals(r6b.at(0), 97);
  assertStrictEquals(r6b.at(1), 49);
  assertStrictEquals(r6.type, "text/plain;p1=a");

  const r7 = DataURL.Resource.fromString('data:text/plain; p1=a;p2="b,c",a1');
  assertStrictEquals(r7.data.byteLength, 5);
  const r7b = new Uint8Array(r7.data);
  assertStrictEquals(r7b[0], 99);
  assertStrictEquals(r7b[1], 34);
  assertStrictEquals(r7b[2], 44);
  assertStrictEquals(r7b[3], 97);
  assertStrictEquals(r7b[4], 49);
  assertStrictEquals(r7.type, "text/plain;p1=a;p2=b");

  const r8 = DataURL.Resource.fromString("data:text/plain,%FF%");
  assertStrictEquals(r8.data.byteLength, 2);
  const r8b = new Uint8Array(r8.data);
  assertStrictEquals(r8b.at(0), 255);
  assertStrictEquals(r8b.at(1), 0x25);
  assertStrictEquals(r8.type, "text/plain");

  const r9 = DataURL.Resource.fromString("data:text/plain,%fff");
  assertStrictEquals(r9.data.byteLength, 2);
  const r9b = new Uint8Array(r9.data);
  assertStrictEquals(r9b.at(0), 255);
  assertStrictEquals(r9b.at(1), 0x66);
  assertStrictEquals(r9.type, "text/plain");

  const r10 = DataURL.Resource.fromString("data:text/plain,a?a=2");
  assertStrictEquals(r10.data.byteLength, 5);
  const r10b = new Uint8Array(r10.data);
  assertStrictEquals(r10b.at(0), 0x61);
  assertStrictEquals(r10b.at(1), 0x3F);
  assertStrictEquals(r10b.at(2), 0x61);
  assertStrictEquals(r10b.at(3), 0x3D);
  assertStrictEquals(r10b.at(4), 0x32);
  assertStrictEquals(r10.type, "text/plain");

  assertThrows(
    () => {
      DataURL.Resource.fromString("data");
    },
    TypeError,
    "dataUrlStr does not reperesent URL",
  );
});

Deno.test("DataURL.Resource.fromURL(URL)", () => {
  const r0 = DataURL.Resource.fromURL(new URL("data:text/plain,"));
  assertStrictEquals(r0.data.byteLength, 0);
  assertStrictEquals(r0.type, "text/plain");

  assertThrows(
    () => {
      DataURL.Resource.fromURL(new URL("data:"));
    },
    TypeError,
    "U+002C not found",
  );

  assertThrows(
    () => {
      DataURL.Resource.fromURL(new URL("data:text/plain"));
    },
    TypeError,
    "U+002C not found",
  );

  assertThrows(
    () => {
      DataURL.Resource.fromURL(new URL("data2:text/plain"));
    },
    TypeError,
    `URL scheme is not "data"`,
  );
});

Deno.test("DataURL.Resource.from(string | URL)", () => {
  const r7 = DataURL.Resource.from('data:text/plain; p1=a;p2="b,c",a1');
  assertStrictEquals(r7.data.byteLength, 5);
  const r7b = new Uint8Array(r7.data);
  assertStrictEquals(r7b[0], 99);
  assertStrictEquals(r7b[1], 34);
  assertStrictEquals(r7b[2], 44);
  assertStrictEquals(r7b[3], 97);
  assertStrictEquals(r7b[4], 49);
  assertStrictEquals(r7.type, "text/plain;p1=a;p2=b");

  const r7u = DataURL.Resource.from(
    new URL('data:text/plain; p1=a;p2="b,c",a1'),
  );
  assertStrictEquals(r7u.data.byteLength, 5);
  const r7ub = new Uint8Array(r7u.data);
  assertStrictEquals(r7ub[0], 99);
  assertStrictEquals(r7ub[1], 34);
  assertStrictEquals(r7ub[2], 44);
  assertStrictEquals(r7ub[3], 97);
  assertStrictEquals(r7ub[4], 49);
  assertStrictEquals(r7u.type, "text/plain;p1=a;p2=b");
});

Deno.test("DataURL.Resource.fromBlob(Blob)", async () => {
  const b1 = new Blob([Uint8Array.of(65, 0, 1, 127)], { type: "text/plain" });
  const r1 = await DataURL.Resource.fromBlob(b1);
  assertStrictEquals(r1.data.byteLength, 4);
  const r1b = new Uint8Array(r1.data);
  assertStrictEquals(r1b.at(0), 65);
  assertStrictEquals(r1b.at(1), 0);
  assertStrictEquals(r1b.at(2), 1);
  assertStrictEquals(r1b.at(3), 127);
  assertStrictEquals(r1.type, "text/plain");
});

Deno.test("DataURL.Resource.prototype.toString()", async () => {
  const b1 = new Blob([Uint8Array.of(65, 0, 1, 127)], { type: "text/plain" });
  const r1 = await DataURL.Resource.fromBlob(b1);
  assertStrictEquals(r1.toString(), "data:text/plain;base64,QQABfw==");
});

Deno.test("DataURL.Resource.prototype.toURL()", async () => {
  const b1 = new Blob([Uint8Array.of(65, 0, 1, 127)], { type: "text/plain" });
  const r1 = await DataURL.Resource.fromBlob(b1);
  assertStrictEquals(r1.toURL().toString(), "data:text/plain;base64,QQABfw==");
});

Deno.test("DataURL.Resource.prototype.toBlob()", async () => {
  const b1 = new Blob([Uint8Array.of(65, 0, 1, 127)], { type: "text/plain" });
  const r1 = await DataURL.Resource.fromBlob(b1);
  const b1c = r1.toBlob();
  const b1cb = new Uint8Array(await b1c.arrayBuffer());
  assertStrictEquals(b1cb[0], 65);
  assertStrictEquals(b1cb[1], 0);
  assertStrictEquals(b1cb[2], 1);
  assertStrictEquals(b1cb[3], 127);
  assertStrictEquals(b1cb.byteLength, 4);
});
