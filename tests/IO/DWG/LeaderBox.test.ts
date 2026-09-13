import { describe, expect, it } from 'vitest';
import { ACadVersion } from '../../../src/ACadVersion.js';
import { CadDocument } from '../../../src/CadDocument.js';
import { Leader } from '../../../src/Entities/Leader.js';
import { DwgReader } from '../../../src/IO/DWG/DwgReader.js';
import { DwgWriter } from '../../../src/IO/DWG/DwgWriter.js';
import { XYZ } from '../../../src/Math/XYZ.js';

function roundtrip(version: ACadVersion): Leader {
	const doc = new CadDocument();
	doc.header.version = version;
	const leader = new Leader();
	leader.vertices = [new XYZ(0, 0, 0), new XYZ(10, 10, 0), new XYZ(20, 10, 0)];
	leader.textHeight = 5.978;
	leader.textWidth = 76.56;
	doc.entities.add(leader);

	const bytes = DwgWriter.writeToBuffer(doc);
	const read = DwgReader.readFromStream(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
	for (const e of read.entities) {
		if (e instanceof Leader) return e;
	}
	throw new Error('Leader not found after roundtrip');
}

describe('Leader box height/width DWG roundtrip', () => {
	it.each([ACadVersion.AC1015, ACadVersion.AC1021, ACadVersion.AC1024, ACadVersion.AC1032])(
		'preserves textHeight/textWidth in %s',
		(version) => {
			const leader = roundtrip(version);
			expect(leader.vertices).toHaveLength(3);
			expect(leader.textHeight).toBeCloseTo(5.978, 6);
			expect(leader.textWidth).toBeCloseTo(76.56, 6);
		}
	);
});
