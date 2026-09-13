import { describe, expect, it } from 'vitest';
import { ACadVersion } from '../../../src/ACadVersion.js';
import { CadDocument } from '../../../src/CadDocument.js';
import { MText } from '../../../src/Entities/MText.js';
import { DwgReader } from '../../../src/IO/DWG/DwgReader.js';
import { DwgWriter } from '../../../src/IO/DWG/DwgWriter.js';
import { XYZ } from '../../../src/Math/XYZ.js';

function roundtrip(version: ACadVersion): MText {
	const doc = new CadDocument();
	doc.header.version = version;
	const mtext = new MText();
	mtext.insertPoint = new XYZ(10, 20, 0);
	mtext.value = 'EXTENTS';
	mtext.height = 3;
	mtext.rectangleWidth = 10;
	mtext.horizontalWidth = 8.8;
	mtext.verticalHeight = 3.5;
	doc.entities.add(mtext);

	const bytes = DwgWriter.writeToBuffer(doc);
	const read = DwgReader.readFromStream(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
	for (const e of read.entities) {
		if (e instanceof MText) return e;
	}
	throw new Error('MText not found after roundtrip');
}

describe('MText extents DWG roundtrip', () => {
	it.each([ACadVersion.AC1015, ACadVersion.AC1021, ACadVersion.AC1032])(
		'preserves horizontalWidth/verticalHeight in %s',
		(version) => {
			const mtext = roundtrip(version);
			expect(mtext.horizontalWidth).toBeCloseTo(8.8, 6);
			expect(mtext.verticalHeight).toBeCloseTo(3.5, 6);
		}
	);
});
