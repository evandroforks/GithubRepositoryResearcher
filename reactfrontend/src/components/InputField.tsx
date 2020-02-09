import React from "react";

interface InputFieldProps {
  sendSearchQuery: Function,
  isSearching: boolean,
  hasSendSearchQuery: boolean
}

interface InputFieldState {
  searchQuery: string,
}

export class InputField extends React.Component<InputFieldProps, InputFieldState>
{
  constructor(props: InputFieldProps) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleInputPathChange = this.handleInputPathChange.bind(this)

    this.state = {
      searchQuery: "language:javascript sort:stars",
    };
  }

  render() {
    const contentStyle = {
      width: "100%"
    };

    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          <input type="text"
            style={contentStyle}
            value={this.state.searchQuery}
            onChange={this.handleInputPathChange} />
        </label>
        <input
          type="submit"
          value={this.props.isSearching ? "Searching..." : this.props.hasSendSearchQuery ? "Start New Search" : "Start Searching"}
          disabled={this.props.isSearching} />
      </form>
    )
  }

  handleInputPathChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState( { searchQuery: event.target.value } );
  }

  handleSubmit(event: React.ChangeEvent<HTMLFormElement>) {
    event.preventDefault();
    this.props.sendSearchQuery( this.state.searchQuery );
  }
}

export default InputField;
