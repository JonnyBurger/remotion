// From https://calculator.aws/pricing/2.0/meteredUnitMaps/lambda/USD/current/lambda.json

import {AwsRegion} from './aws-regions';

export const pricing: {
	[key in AwsRegion]: {
		'Lambda Duration': {
			rateCode: string;
			price: string;
		};
		'Lambda Duration-Provisioned': {
			rateCode: string;
			price: string;
		};
		'Lambda Provisioned-Concurrency': {
			rateCode: string;
			price: string;
		};
		'Lambda Requests': {
			rateCode: string;
			price: string;
		};
	};
} = {
	'af-south-1': {
		'Lambda Duration': {
			rateCode: 'Z6UGBG979PFHQNPH.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000221000',
		},
		'Lambda Duration-Provisioned': {
			rateCode: 'X7CK6KFXNWY9RF6Z.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000129000',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'R7SEQT2WRDVFV6ZA.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000055300',
		},
		'Lambda Requests': {
			rateCode: 'BNQXHCKJQCQXPHE8.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002700',
		},
	},
	'ap-east-1': {
		'Lambda Duration': {
			rateCode: 'Y3J9NSBFENB45VFD.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000229200',
		},
		'Lambda Duration-Provisioned': {
			rateCode: 'G5524SRW6HD6742P.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000133358',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'YY2W7HU5HZERD9YH.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000057153',
		},
		'Lambda Requests': {
			rateCode: '68H82NC62DFBNEVM.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002800',
		},
	},
	'ap-south-1': {
		'Lambda Duration': {
			rateCode: 'PHDF9YNAFR3HDSR8.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000166667',
		},
		'Lambda Duration-Provisioned': {
			rateCode: 'QKVFMCSDP4AVPEE7.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000104966',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'ATX3ZXV9GDMQWKUN.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000044985',
		},
		'Lambda Requests': {
			rateCode: 'VPGUBFQ4KNZKMKGJ.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
	},
	'ap-northeast-3': {
		'Lambda Duration': {
			rateCode: 'HQWXQQHHTTTVSUH2.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000215300',
		},
		'Lambda Duration-Provisioned': {
			rateCode: 'UZWTTB7ZV7B2GMG5.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000125600',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: '8ZQGQZJZS48NB28R.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000053800',
		},
		'Lambda Requests': {
			rateCode: '89U8ZQR2ZV45HXWY.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002600',
		},
	},
	'ap-northeast-2': {
		'Lambda Duration': {
			rateCode: 'AW8K7Q9ZMMBBP9W6.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000166667',
		},
		'Lambda Duration-Provisioned': {
			rateCode: 'GX89TXD63W6NZ626.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000119592',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'UP7EY8NNX8VZF5MD.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000051254',
		},
		'Lambda Requests': {
			rateCode: 'NFXH9EUGP7BUPE4A.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
	},
	'ap-southeast-1': {
		'Lambda Duration': {
			rateCode: '67ZV6RMYY72YSRDC.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000166667',
		},
		'Lambda Duration-Provisioned': {
			rateCode: 'Z43QGMUZW4S2XN34.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000121313',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'A4HTACA65772T7MD.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000051991',
		},
		'Lambda Requests': {
			rateCode: '36D3E7396ZKUSWWW.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
	},
	'ap-southeast-2': {
		'Lambda Duration': {
			rateCode: '4NX7CSSF3DVPXWBT.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000166667',
		},
		'Lambda Duration-Provisioned': {
			rateCode: 'NBPYMYTJX2CTM4AJ.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000122173',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: '3MZN5YQ2PU7VCFH8.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000052360',
		},
		'Lambda Requests': {
			rateCode: 'ZW6UHD4Q6EPUCZWU.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
	},
	'ap-northeast-1': {
		'Lambda Duration': {
			rateCode: 'FSYUV9NMNDEXRJ5H.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000166667',
		},
		'Lambda Duration-Provisioned': {
			rateCode: 'CQ446M27PP4V4UVB.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000125615',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'ZVA2Z6TTQNFCXFSU.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000053835',
		},
		'Lambda Requests': {
			rateCode: '3BE8DYKG4FYSZGDW.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
	},
	'ca-central-1': {
		'Lambda Duration': {
			rateCode: 'KS26AK5FJMDYPXSF.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000166667',
		},
		'Lambda Duration-Provisioned': {
			rateCode: 'ZMDUKS3D6V7QJFQT.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000108407',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: '9M447J8E9CJSZFKY.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000046460',
		},
		'Lambda Requests': {
			rateCode: 'XM5KDGVKY9KYJWCG.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
	},
	'eu-central-1': {
		'Lambda Duration': {
			rateCode: 'S4ZKFHQ6B28FBYVW.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000166667',
		},
		'Lambda Duration-Provisioned': {
			rateCode: '6963ZK4U22NHS35G.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000117011',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'SADU4Z93G2F3QPA2.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000050147',
		},
		'Lambda Requests': {
			rateCode: 'CKZQ3D25MV9ET243.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
	},
	'eu-west-1': {
		'Lambda Duration': {
			rateCode: 'SGGKTWDV7PGMPPSJ.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000166667',
		},
		'Lambda Duration-Provisioned': {
			rateCode: 'ZS4KB9WXZA5FWZ7A.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000108407',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'BP8P7CBMNM86SRMW.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000046460',
		},
		'Lambda Requests': {
			rateCode: 'B5V2RNHAWGVJBZD3.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
	},
	'eu-west-2': {
		'Lambda Duration': {
			rateCode: 'RP9RSZYUC96SQ4G2.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000166667',
		},
		'Lambda Duration-Provisioned': {
			rateCode: 'W62XX94KDFQQKBSD.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000112709',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: '6DB7ZBYMK456XGDS.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000048304',
		},
		'Lambda Requests': {
			rateCode: 'NDYBVXT3KB548Z2A.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
	},
	'eu-south-1': {
		'Lambda Duration': {
			rateCode: 'SWU8SVYB8U6S2RXR.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000195172',
		},
		'Lambda Duration-Provisioned': {
			rateCode: 'CQ3MCSJ8KUN9AG4M.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000113827',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'WCTG35VUU2JTG398.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000048783',
		},
		'Lambda Requests': {
			rateCode: 'EE6A5VEB3PCF9VKU.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002300',
		},
	},
	'eu-west-3': {
		'Lambda Duration': {
			rateCode: '7V27U9PFRJGUDWJ8.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000166667',
		},
		'Lambda Duration-Provisioned': {
			rateCode: '8XRAXPBUT4QZ92DT.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000113569',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'HYMBKMJZP76PZ7UF.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000048673',
		},
		'Lambda Requests': {
			rateCode: '6GFK8TZW8U8G9MUB.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
	},
	'eu-north-1': {
		'Lambda Duration': {
			rateCode: '7N49FRQMXS49C2QS.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000166667',
		},
		'Lambda Duration-Provisioned': {
			rateCode: 'PK4HANPQ3MKK2P4F.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000103245',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'C8CESGBREP8BBMUZ.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000044248',
		},
		'Lambda Requests': {
			rateCode: 'KERWZD8CJ22SEZWT.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
	},
	'me-south-1': {
		'Lambda Duration': {
			rateCode: 'N7S38YMSMVSPHNAH.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000206667',
		},
		'Lambda Duration-Provisioned': {
			rateCode: '55WKNBUF5TE92NZJ.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000119251',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'RPTP77J75VAKQZD9.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000051108',
		},
		'Lambda Requests': {
			rateCode: 'EMZ8YZDPGWMDYZNK.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002500',
		},
	},
	'sa-east-1': {
		'Lambda Duration': {
			rateCode: 'JNXN2GCNDMDR7JAF.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000166667',
		},
		'Lambda Duration-Provisioned': {
			rateCode: 'VENWZ787B7TGFR3E.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000154867',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: '8CC33XHRZVTNGE2A.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000066372',
		},
		'Lambda Requests': {
			rateCode: '7TZ969MZND3Z6HD7.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
	},
	'us-east-1': {
		'Lambda Duration': {
			rateCode: 'TG3M4CAGBA3NYQBH.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000166667',
		},
		'Lambda Duration-Provisioned': {
			rateCode: 'ZZF88MXYPS4DGSEZ.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000097222',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'BMKCD2ZCEYKTYYCB.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000041667',
		},
		'Lambda Requests': {
			rateCode: 'GU2ZS9HVP6QTQ7KE.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
	},
	'us-east-2': {
		'Lambda Duration': {
			rateCode: '3BYZH4NKJN8TJUQ6.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000166667',
		},
		'Lambda Duration-Provisioned': {
			rateCode: '8RKHZ54QB9XA3Y9F.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000097222',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'ZA4ZDREWFS9UEMSC.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000041667',
		},
		'Lambda Requests': {
			rateCode: 'ZEA64MMVK5QRB5TC.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
	},
	'us-west-1': {
		'Lambda Duration': {
			rateCode: '46GNEXAQAPS9YGE2.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000166667',
		},
		'Lambda Duration-Provisioned': {
			rateCode: 'X79AKVS7VZDNBZ9U.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000114430',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'QP9Q8TWYNJX4PDBS.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000049041',
		},
		'Lambda Requests': {
			rateCode: 'YY4C5XTAZNQPB6J6.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
	},
	'us-west-2': {
		'Lambda Duration': {
			rateCode: 'XCU6U9G4FCKZQWG9.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000166667',
		},
		'Lambda Duration-Provisioned': {
			rateCode: 'MP7NQ6MSH3HNCZP6.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000097222',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: '67MDK2GR6PRT8GW8.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000041667',
		},
		'Lambda Requests': {
			rateCode: 'ZWHFK83WS2P4WZR6.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
	},
};
