import React, { useState, useEffect } from 'react';
import './App.css';

type MsgBy = "dark" | "light" | "system";


// This is for branching paths;
interface Option {
	name: string,
	next: number,
};

interface Message {
	msg: string,
	by?: MsgBy,
	next: number, // next message to go to;
	options?: Option[], // branching paths;
}


interface WriterProps {
	text: string,
	delay: number,
}


const Typewriter = (
	{
		text,
		delay, 
	}: WriterProps) => {

  let [currentText, setCurrentText] = useState('');
  let [currentIndex, setCurrentIndex] = useState(0);

	// Not having this broke something, though i cannot quite recall what that was...
	// try taking it out ig 🤷
	useEffect(()=>{
  	setCurrentText('');
  	setCurrentIndex(0);
  },[text, delay])

	useEffect(() => {

	let skip = false;

	// skip dialogue on pressing spacebar;
	window.onkeydown = (e) => {
			switch (e.key) {
				case " ":
					skip = true;
					break;
				default:
					break;
			}
	};


	// This is what does the actual text animation. i borrowed this code from a tutorial so im not 100% sure how it works :)
  if (currentIndex < text.length) {
    const timeout = setTimeout(() => {
			if (skip) {
				setCurrentText(text);
				return;
			} else {
				setCurrentText(prevText => prevText + text[currentIndex]);
      	setCurrentIndex(prevIndex => prevIndex + 1);
			}
    }, delay);

    return () => clearTimeout(timeout);
  }
}, [currentIndex, delay, text]);

  return <span>{currentText}</span>;
};

interface MsgBoxProps {
	msg: Message,
	nextMsg?: (next: number) => void,
	next?: number,
}

// This component exists so that i don't have to duplicate code for light and dark, and also to clean up the main component.
// It ended up achieving the second goal but not the first one...
const MsgBox = (
	{
		msg,
		next,

		nextMsg,
	}: MsgBoxProps) => {

	let id; 
	switch(msg.by) {
		case "light":
		id = "lightbox"
		break;
		case "dark":
		id = "darkbox"
		break;
		case "system":
		id = " "
		break;
	}

	return (
		<div className="messageBox" id={id}
		>
			<div className="dialogueBox">

				{
					msg.by === "light" 
					?
					<div className="avatar">
						<img src="mj150light.png" alt="" />
					</div>
					: <></>
				}

				<div className="messages">
					<p style={{textAlign: "left"}}>
						<Typewriter 
							text={msg.msg} 
							delay={10} 
							/>
					</p>
				</div>

				{
					msg.by === "dark" 
					?
					<div className="avatar">
						<img src="mj150dark.png" alt="" />
						<div className="name">drk</div>
					</div>
					: <></>
				}

			</div>

			{
				msg.by === "light"
				? 			
				<div className="bottomBox">

					<div className="name">Sir Lightworth Lightington III</div>

					{
						msg.options && nextMsg
						?
							// if there are branches in the dialogue, display options for the branches;
							<div className="options">
								{msg.options.map(opt => {
									return(
										<button className="option" 
											key={opt.name}	
											onClick={() => nextMsg(opt.next)}>
											{opt.name}
										</button>
									)
								})}
							</div>
						:
							// if there arent any options, just put a next button;
							<div className="options">
								<button className="option" 
									onClick={() => nextMsg !== undefined ? nextMsg( next !== undefined ? next : 0) : new Error ("nextMsg not found")}
									>{"->"}</button>
							</div>
					}	

				</div>
			: 				
			// this is here for alignment only;
			<div className="bottomBox">

			</div>
			}

		</div>

	)
}

type bubble = "Light" | "Dark"

function App() {

	// the entire dialogue tree;
	let messages: Message[] = [
		{msg: "I, am sir lightworth lightington the third, heir to the throne of the lightside empire, saviour of the lands of lightness and moderator of internet chat forums, who are you?", by: "light", next: 1},
		{msg: "im d4rk", by: "dark", next: 2},
		{msg: "D- D four R k?", by: "light", next: 3},
		{msg: "That's a stupid name.", by: "light", next: 4},
		{msg: "right, as if lightworth lightington isn't", by: "dark", next: 5},
		{msg: "How DARE you insult the house of lightington!!!", by: "light", next: 6,
		options: [{name: "Insult him back", next: 6}, {name: "Run away...", next: 9}]},
		{msg: "You're ugly!!!", by: "light", next: 7},
		{msg: "ow", by: "dark", next: 9},
		{msg: "Im telling my father!", by: "light", next: 10},

		{msg: "You leave victorious...", by: "system", next: -1}, 	// the -1 doesn't mean anything;;
		{msg: "You run away in defeat...", by: "system", next: -1},	// dialogue doesn't go past this screen anyway;;
	]

	// chat bubbles;
	let [bubbles, setBubbles] = useState<bubble[]>(["Light"]);

	let [currentMsg, setCurrentMsg] = useState<Message>(messages[0]);
	// This variable keeps track of the next dialogue, and is useful when there are options to handle;
	let [next, setNext] = useState<number>(currentMsg.next !== undefined ? currentMsg.next : 0);

	let [lmsg, setLMSG] = useState<Message|undefined>(currentMsg);
	let [dmsg, setDMSG] = useState<Message|undefined>();

	let [smsg, setSMSG] = useState<Message|undefined>();

	const nextMsg = (next: number) => {
		setCurrentMsg(messages[next]);
		setNext(messages[next].next)
		if (bubbles.length > 3) {
			let b = bubbles.slice(1);
			console.log(b);
			setBubbles([...b]);
		} 
		setBubbles(prev => [...prev, messages[next].by === "light" ? "Light" : "Dark"]);
	}

	useEffect(() => {
		switch(currentMsg.by) 
		{ 
			case "light":
				setLMSG(currentMsg) 
				break;
			case "dark":
				setDMSG(currentMsg);
				break;
			case "system":
				setLMSG(undefined);
				setDMSG(undefined);
				setSMSG(currentMsg);
		}
		if (currentMsg.next > 0)
		setNext(currentMsg.next);
	}, [currentMsg])
	
  return (
    <div className="App">
	
			{ 
				dmsg 
				?
				<MsgBox msg={dmsg} 
					/>
				:
				<div className="messageBox">
					<div className="dialogueBox"></div>
				</div>
			}

			<div id="chat-window">

				
				{
				// this is just for alignment
				}
				<div id="filler" />
				<div id="messages">
					<div id="messageList">

						{
							bubbles.map(bbl => {
								return (
									bbl === "Light"
									?
									<div className="lightRow">
									<div className="bblLight">...</div>
									</div>
									:
									<div className="darkRow">
										<div className="bblDark">...</div>
									</div>
								)
							})
						}

					</div>
					<div id="chatBox">

						<div id="type"></div>
						<div id="enter"></div>
						
					</div>

				</div>
				<div id="filler" />

			</div>

			{ 
				lmsg 
				?
				<MsgBox msg={lmsg} 
					next={next}
					nextMsg={nextMsg} 
					/>
				:
				smsg
				?
				<MsgBox msg={smsg} 
				nextMsg={nextMsg} 
				/>
				:
				<div className="messageBox">
					<div className="dialogueBox"></div>
				</div>
			}
    </div>
  );
}

export default App;
